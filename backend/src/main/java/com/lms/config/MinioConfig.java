package com.lms.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
public class MinioConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucket;

    // Optional public endpoint that browsers can reach (e.g. http://localhost:9000)
    @Value("${MINIO_PUBLIC_ENDPOINT:}")
    private String minioPublicEndpoint;

    /**
     * Client for all storage operations (uploads, streaming, stat, delete).
     * Always talks to the internal endpoint, so backend startup and health
     * never depend on the public endpoint being resolvable from the backend.
     */
    @Bean
    @Primary
    public MinioClient minioClient() {
        try {
            MinioClient client = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();

            // Crear bucket si no existe
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Bucket created: {}", bucket);
            }

            return client;
        } catch (Exception e) {
            throw new RuntimeException("Error initializing MinIO client", e);
        }
    }

    /**
     * Client used ONLY to sign presigned URLs. Built with the public endpoint
     * (when configured) so the URL's authority matches what the browser will
     * use and the signature validates. Building it makes no network calls —
     * presigning is a local computation.
     */
    @Bean
    public MinioClient minioPresignerClient() {
        String endpointToUse = (minioPublicEndpoint != null && !minioPublicEndpoint.isBlank())
                ? minioPublicEndpoint
                : endpoint;
        return MinioClient.builder()
                .endpoint(endpointToUse)
                .credentials(accessKey, secretKey)
                .build();
    }
}
