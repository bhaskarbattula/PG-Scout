package com.pgfinder.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

  private boolean success;
  private String message;
  private T data;
  private Instant timestamp;
  private PaginationMeta pagination;

  public ApiResponse() {
    this.timestamp = Instant.now();
  }

  public static <T> ApiResponse<T> ok(T data) {
    ApiResponse<T> response = new ApiResponse<>();
    response.success = true;
    response.message = "Success";
    response.data = data;
    return response;
  }

  public static <T> ApiResponse<T> ok(T data, String message) {
    ApiResponse<T> response = ok(data);
    response.message = message;
    return response;
  }

  public static <T> ApiResponse<T> ok(T data, PaginationMeta pagination) {
    ApiResponse<T> response = ok(data);
    response.pagination = pagination;
    return response;
  }

  public static <T> ApiResponse<T> error(String message) {
    ApiResponse<T> response = new ApiResponse<>();
    response.success = false;
    response.message = message;
    return response;
  }

  public boolean isSuccess() { return success; }
  public String getMessage() { return message; }
  public T getData() { return data; }
  public Instant getTimestamp() { return timestamp; }
  public PaginationMeta getPagination() { return pagination; }

  public record PaginationMeta(int page, int size, long total, int totalPages) {}
}
