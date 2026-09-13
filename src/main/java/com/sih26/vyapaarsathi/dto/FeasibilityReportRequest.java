package com.sih26.vyapaarsathi.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeasibilityReportRequest {

    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 100, message = "Owner name must be between 2 and 100 characters")
    private String ownerName;

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 100, message = "Age must be at most 100")
    private Integer age;

    @NotNull(message = "Margin capital is required")
    @DecimalMin(value = "1000.00", message = "Margin capital must be at least ₹1,000.00")
    private BigDecimal marginCapital;

    @NotBlank(message = "Business category is required")
    private String businessCategory;

    @NotBlank(message = "Business idea description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String businessIdeaDescription;

    @NotNull(message = "Village LGD code is required")
    private Integer villageLgdCode;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    @Builder.Default
    private Integer radiusKm = 10;
}
