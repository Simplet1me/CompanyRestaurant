package com.simplet1me.companyrestaurant.utils;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.MinioException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Data
@AllArgsConstructor
@Slf4j
public class MinioOssUtil {

    private String endpoint;
    private String accessKeyId;
    private String accessKeySecret;
    private String bucketName;

    public String udloadFile(String objectName, InputStream in) throws IOException, NoSuchAlgorithmException, InvalidKeyException {
        String url="";
        try {
            MinioClient minioClient =
                    MinioClient.builder()
                            .endpoint(endpoint)
                            .credentials(accessKeyId, accessKeySecret)
                            .build();

            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            } else {
                System.out.println("Bucket " + bucketName +" already exists.");
            }
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(in, in.available(), -1)
                            .build());

            System.out.println("文件已上传至" + bucketName);
            url = endpoint + "/" + bucketName + "/" + objectName;
        } catch (MinioException e) {
            System.out.println("错误: " + e);
            System.out.println("服务器地址: " + e.httpTrace());
        } finally {
            if (in != null) {
                in.close();
            }
        }

        log.info("文件上传到:{}", url);

        return url;
    }
}
