package com.sih26.vyapaarsathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReverseGeocodeResponse {
    private String formattedAddress;
    private String villageName;
    private String subdistrictName;
    private String districtName;
    private String postalCode;
    private Integer nearestVillageLgdCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
