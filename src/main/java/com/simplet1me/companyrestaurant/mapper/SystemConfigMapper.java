package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.SystemConfig;
import org.apache.ibatis.annotations.Param;

/**
 * 系统配置表 Mapper
 */
public interface SystemConfigMapper {

    SystemConfig findByKey(@Param("configKey") String configKey);

    /** 插入或更新（键冲突时更新值） */
    int upsert(@Param("configKey") String configKey, @Param("configValue") String configValue,
               @Param("description") String description);
}
