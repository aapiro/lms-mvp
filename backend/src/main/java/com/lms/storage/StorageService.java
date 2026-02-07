package com.lms.storage;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {
    
    private final MinioClient minioClient;
    
    @Value("${minio.bucket}")
    private String bucket;

    // Optional public endpoint to make presigned URLs reachable from host/browser
    @Value("${MINIO_PUBLIC_ENDPOINT:}")
    private String minioPublicEndpoint;

    public String uploadFile(MultipartFile file, String folder) {
        try {
            String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
            
            InputStream inputStream = file.getInputStream();
            
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            
            log.info("File uploaded: {}", fileName);
            return fileName;
            
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to MinIO", e);
        }
    }
    
    public String getPresignedUrl(String fileKey, int expirationMinutes) {
        try {
            // Generate presigned URL using the MinioClient. The client is built with
            // the public endpoint when configured (see MinioConfig), so the returned
            // presigned URL will be reachable from the browser and the signature will match.
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(fileKey)
                            .expiry(expirationMinutes, TimeUnit.MINUTES)
                            .build()
            );
         } catch (Exception e) {
             throw new RuntimeException("Error generating presigned URL", e);
         }
     }

    public void deleteFile(String fileKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileKey)
                            .build()
            );
            log.info("File deleted: {}", fileKey);
        } catch (Exception e) {
            log.error("Error deleting file: {}", fileKey, e);
        }
    }

    // Stat object to obtain size and content-type
    public StatObjectResponse statObject(String fileKey) {
        try {
            return minioClient.statObject(StatObjectArgs.builder().bucket(bucket).object(fileKey).build());
        } catch (Exception e) {
            throw new RuntimeException("Error statting object: " + fileKey, e);
        }
    }

    // Stream object (supports Range requests). Writes directly to HttpServletResponse.
    public void streamFileToResponse(String fileKey, HttpServletRequest request, HttpServletResponse response) {
        try {
            StatObjectResponse stat = statObject(fileKey);
            long objectSize = stat.size();
            String contentType = stat.contentType();
            if (contentType == null || contentType.isBlank()) contentType = "application/octet-stream";

            String rangeHeader = request.getHeader("Range");
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                // Parse Range: bytes=start-end
                String rangeValue = rangeHeader.substring("bytes=".length()).trim();
                String[] parts = rangeValue.split("-", 2);
                long start = parts[0].isEmpty() ? 0 : Long.parseLong(parts[0]);
                long end;
                if (parts.length > 1 && !parts[1].isEmpty()) {
                    end = Long.parseLong(parts[1]);
                } else {
                    end = objectSize - 1;
                }
                if (start < 0) start = 0;
                if (end >= objectSize) end = objectSize - 1;
                if (start > end) {
                    response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
                    response.setHeader("Content-Range", "bytes */" + objectSize);
                    return;
                }
                long length = end - start + 1;

                response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
                response.setHeader("Content-Type", contentType);
                response.setHeader("Accept-Ranges", "bytes");
                response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + objectSize);
                response.setHeader("Content-Length", String.valueOf(length));

                try (InputStream is = minioClient.getObject(GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileKey)
                        .offset(start)
                        .length(length)
                        .build());
                     OutputStream os = response.getOutputStream()) {
                    byte[] buffer = new byte[64 * 1024];
                    int read;
                    while ((read = is.read(buffer)) != -1) {
                        os.write(buffer, 0, read);
                    }
                    os.flush();
                }
            } else {
                // Full content
                response.setStatus(HttpServletResponse.SC_OK);
                response.setHeader("Content-Type", contentType);
                response.setHeader("Content-Length", String.valueOf(objectSize));
                response.setHeader("Accept-Ranges", "bytes");

                try (InputStream is = minioClient.getObject(GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileKey)
                        .build());
                     OutputStream os = response.getOutputStream()) {
                    byte[] buffer = new byte[64 * 1024];
                    int read;
                    while ((read = is.read(buffer)) != -1) {
                        os.write(buffer, 0, read);
                    }
                    os.flush();
                }
            }
        } catch (Exception e) {
            log.error("Error streaming file {}: {}", fileKey, e.getMessage());
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error streaming file");
            } catch (Exception ex) {
                // ignore
            }
        }
    }
}
