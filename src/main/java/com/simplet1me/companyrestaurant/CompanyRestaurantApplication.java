package com.simplet1me.companyrestaurant;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.simplet1me.companyrestaurant.mapper")
public class CompanyRestaurantApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompanyRestaurantApplication.class, args);
    }

}
