package com.simplet1me.companyrestaurant.controller;

import com.simplet1me.companyrestaurant.common.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import java.util.Base64;
import static org.junit.jupiter.api.Assertions.*;

class FileControllerTests {
    @Test void detectsImageContentAndRejectsDisguisedFiles() {
        assertEquals("png", FileController.imageType(Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB")));
        assertEquals("gif", FileController.imageType("GIF89a00000000".getBytes()));
        assertEquals("webp", FileController.imageType("RIFF0000WEBP00".getBytes()));
        assertThrows(BusinessException.class, () -> FileController.imageType("<svg>hello</svg>".getBytes()));
    }

    @Test void rejectsEmptyAndOversizedFilesBeforeContactingMinio() {
        var controller = new FileController("http://127.0.0.1:9000", "admin", "testsecret", "company-restaurant");
        assertThrows(BusinessException.class, () -> controller.upload(new MockMultipartFile("file", new byte[0])));
        assertThrows(BusinessException.class, () -> controller.upload(new MockMultipartFile("file", new byte[5 * 1024 * 1024 + 1])));
    }
}
