package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 文件服务接口。
 *
 * TODO 文件上传（课程必做项）暂未实现：
 *  1. 菜品图片上传 POST /api/files/upload/image —— multipart 上传至 MinIO（utils/MinioOssUtil 已有封装），
 *     返回访问 URL 存入食谱/菜单 photo 字段；限制 jpg/jpeg/png/gif/webp、≤5MB。
 *  2. 用户批量导入 POST /api/users/import —— Excel（EasyExcel）上传解析入库（见 UserController TODO）。
 *  实现后同步更新 docs/interfaces.md 与 frontend/interfaces.md。
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    /** 占位：保证拦截器路径匹配不报错；上传接口实现后替换 */
    @RequestMapping
    public Result<Void> todo() {
        return Result.error(400, "文件上传功能开发中");
    }
}
