package com.pgfinder.service;

import com.pgfinder.dto.response.BranchResponse;
import com.pgfinder.dto.response.ChatResponse;
import com.pgfinder.dto.response.CompanyResponse;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

  private static final Logger log = LoggerFactory.getLogger(ChatService.class);

  private final ChatClient chatClient;
  private final CompanyService companyService;
  private final BranchService branchService;
  private final SearchService searchService;

  private static final List<String> DEFAULT_SUGGESTIONS = List.of(
      "Find PGs near Amazon Bangalore",
      "PGs near TCS Hyderabad",
      "Infosys Mysore offices",
      "Microsoft Gachibowli PGs",
      "PGs under ₹8000 near Hitech City"
  );

  public ChatService(ChatClient.Builder chatClientBuilder, CompanyService companyService,
      BranchService branchService, SearchService searchService) {
    this.chatClient = chatClientBuilder
        .defaultSystem("""
            You are a helpful PG (Paying Guest) finder assistant for India.
            Your role is to help employees find PGs near their workplace.
            Be concise, friendly, and helpful.
            If the user mentions a company name, help them find its branches.
            If they mention a location, help them find PGs nearby.
            You can only assist with PG search - do not provide unrelated advice.""")
        .build();
    this.companyService = companyService;
    this.branchService = branchService;
    this.searchService = searchService;
  }

  public List<String> getSuggestions() {
    return DEFAULT_SUGGESTIONS;
  }

  public ChatResponse processMessage(String message, UUID branchId) {
    if (branchId != null) {
      var branch = branchService.getBranch(branchId);
      var company = companyService.getCompany(branch.companyId());
      var result = searchService.search(null, branchId, null, null, null,
          null, null, null, 0, 10);

      return ChatResponse.withPGs(
          "Here are PGs near %s in %s".formatted(branch.name(), branch.cityName()),
          result.pgListings()
      );
    }

    CompanyResponse company = companyService.findByName(message);
    if (company != null) {
      List<BranchResponse> branches = branchService.getBranchesByCompany(company.id());
      if (branches.isEmpty()) {
        return ChatResponse.text(
            "We found %s in our database but no branches are listed yet.".formatted(company.name()),
            List.of("Search PGs near me", "Browse all companies")
        );
      }
      if (branches.size() == 1) {
        var result = searchService.search(null, branches.get(0).id(),
            null, null, null, null, null, null, 0, 10);
        return ChatResponse.withPGs(
            "Here are PGs near %s %s".formatted(company.name(), branches.get(0).cityName()),
            result.pgListings()
        );
      }
      return ChatResponse.withBranches(
          "We found %d branches for %s. Please select one:".formatted(branches.size(), company.name()),
          branches
      );
    }

    var searchResult = searchService.search(message, null, null, null, null,
        null, null, null, 0, 10);
    if (!searchResult.pgListings().isEmpty()) {
      return ChatResponse.withPGs(
          "Found %d PGs matching your search.".formatted(searchResult.pgListings().size()),
          searchResult.pgListings()
      );
    }

    String aiResponse = generateAIResponse(message);
    return ChatResponse.text(aiResponse, List.of(
        "Try searching: Amazon Bangalore",
        "PGs in Hitech City",
        "Girls PG in Koramangala"
    ));
  }

  private String generateAIResponse(String message) {
    try {
      List<Message> messages = List.of(
          new UserMessage(message)
      );
      return chatClient.prompt()
          .messages(messages)
          .call()
          .content();
    } catch (Exception e) {
      log.error("AI chat error", e);
      return "I can help you find PGs! Try searching for a company like 'Amazon Bangalore' or a location like 'Hitech City'.";
    }
  }
}
