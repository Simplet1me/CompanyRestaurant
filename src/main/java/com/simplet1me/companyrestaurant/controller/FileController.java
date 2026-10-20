package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.common.Result;
import com.simplet1me.companyrestaurant.annotation.RequireRole;
import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.entity.Role;
import io.minio.*;
import io.minio.errors.ErrorResponseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 文件服务接口。
 *
 * 图片保存在私有桶中，通过固定资源地址读取，无需开放整个桶。
 */
@RestController
public class FileController {
    private final MinioClient client;
    private final String bucket;

    public FileController(@Value("${minio.endpoint}") String endpoint,
                          @Value("${minio.access-key}") String accessKey,
                          @Value("${minio.secret-key}") String secretKey,
                          @Value("${minio.bucket}") String bucket) {
        this.client = MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build();
        this.bucket = bucket;
    }

    // 文件上传
    @PostMapping("/api/files/upload/image")
    @RequireRole({Role.MANAGER, Role.CHEF})
    public Result<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) throw new BusinessException("请选择不超过5MB的图片");
        byte[] bytes = file.getBytes();
        String type = imageType(bytes);
        // UUID 重命名，防止用户上传的图片名字重复
        String name = UUID.randomUUID() + "." + type;
        // 调用Minio接口，上传文件
        try (var input = new ByteArrayInputStream(bytes)) {
            client.putObject(PutObjectArgs.builder().bucket(bucket).object("images/" + name)
                    .stream(input, bytes.length, -1).contentType("image/" + type).build());
        }
        return Result.success(Map.of("url", "/uploads/image/" + name));
    }

    @GetMapping("/uploads/image/{name}")
    public ResponseEntity<byte[]> image(@PathVariable String name) throws Exception {
        if (!name.matches("[a-f0-9-]{36}\\.(jpeg|png|gif|webp)")) return ResponseEntity.notFound().build();
        try (var input = client.getObject(GetObjectArgs.builder().bucket(bucket).object("images/" + name).build())) {
            return ResponseEntity.ok().contentType(MediaType.parseMediaType("image/" + name.substring(name.lastIndexOf('.') + 1)))
                    .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                    .header("X-Content-Type-Options", "nosniff").body(input.readAllBytes());
        } catch (ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code())) return ResponseEntity.notFound().build();
            throw e;
        }
    }

    // 通过编码判断文件类型
    static String imageType(byte[] b) {
        if (b.length >= 12) {
            if ((b[0] & 255) == 255 && (b[1] & 255) == 216 && (b[2] & 255) == 255) return "jpeg";
            if ((b[0] & 255) == 137 && b[1] == 80 && b[2] == 78 && b[3] == 71 && b[4] == 13 && b[5] == 10 && b[6] == 26 && b[7] == 10) return "png";
            String head = new String(b, 0, 12, java.nio.charset.StandardCharsets.ISO_8859_1);
            if (head.startsWith("GIF87a") || head.startsWith("GIF89a")) return "gif";
            if (head.startsWith("RIFF") && head.substring(8).equals("WEBP")) return "webp";
        }
        throw new BusinessException("仅支持JPEG、PNG、GIF、WebP图片，请检查文件内容");
    }
}
