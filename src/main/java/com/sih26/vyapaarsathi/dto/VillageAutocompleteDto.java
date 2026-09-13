package com.sih26.vyapaarsathi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VillageAutocompleteDto {
    private int villageLgdCode;
    private String villageName;
    private String subdistrictName;
    private String districtName;
    private String stateName;
    private String displayText;
}
