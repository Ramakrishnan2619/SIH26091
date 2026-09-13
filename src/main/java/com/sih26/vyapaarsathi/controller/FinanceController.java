package com.sih26.vyapaarsathi.controller;

import com.sih26.vyapaarsathi.dto.AmortizationTableRequest;
import com.sih26.vyapaarsathi.dto.CanonicalModule2Result;
import com.sih26.vyapaarsathi.dto.FinanceCalculateRequest;
import com.sih26.vyapaarsathi.dto.QuarterRecordDto;
import com.sih26.vyapaarsathi.service.FinancialCalculatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinancialCalculatorService financialCalculatorService;

    @PostMapping("/calculate")
    public ResponseEntity<CanonicalModule2Result> calculate(@Valid @RequestBody FinanceCalculateRequest request) {
        CanonicalModule2Result result = financialCalculatorService.calculate(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/amortization-table")
    public ResponseEntity<List<QuarterRecordDto>> generateTable(@Valid @RequestBody AmortizationTableRequest request) {
        List<QuarterRecordDto> schedule = financialCalculatorService.generateAmortizationSchedule(
                request.getLoanAmount(),
                request.getInterestRatePa(),
                request.getTenureMonths(),
                request.getMoratoriumMonths()
        );
        return ResponseEntity.ok(schedule);
    }
}
