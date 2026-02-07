package com.lms.storage;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {
    
    private final MinioClient minioClient;
    
    @Value("${minio.bucket}")
    private String bucket;
    
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
}
