package com.sih26.vyapaarsathi.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    /**
     * Forwards non-API and non-static single-page application routes to index.html.
     */
    @GetMapping(value = {"/assess", "/report", "/login", "/settings", "/login/callback"})
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
