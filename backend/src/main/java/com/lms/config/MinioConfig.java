package com.lms.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

    @Bean
    public MinioClient minioClient() {
        try {
            // If a public endpoint is provided, use it for client creation so
            // presigned URLs are generated with the same authority the browser will use.
            String endpointToUse = (minioPublicEndpoint != null && !minioPublicEndpoint.isBlank()) ? minioPublicEndpoint : endpoint;

            MinioClient client = MinioClient.builder()
                    .endpoint(endpointToUse)
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
}
