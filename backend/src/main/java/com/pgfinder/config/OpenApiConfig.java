package com.pgfinder.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("PG Finder API")
            .description("Workplace-aware PG and hostel discovery platform API. "
                + "Search PGs near your workplace by company name, branch, or location.")
            .version("1.0.0")
            .contact(new Contact()
                .name("PG Finder Team")
                .email("hello@pgfinder.in")
                .url("https://pgfinder.in"))
            .license(new License()
                .name("MIT")
                .url("https://opensource.org/licenses/MIT")));
  }
}
