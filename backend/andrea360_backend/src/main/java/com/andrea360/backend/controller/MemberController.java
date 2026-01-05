package com.andrea360.backend.controller;

import com.andrea360.backend.dto.member.CreateMemberRequest;
import com.andrea360.backend.dto.member.MemberResponse;
import com.andrea360.backend.dto.member.UpdateMemberRequest;
import com.andrea360.backend.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemberResponse create(@Valid @RequestBody CreateMemberRequest request) {
        return memberService.create(request);
    }

    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable Long id,
                                 @Valid @RequestBody UpdateMemberRequest request) {
        return memberService.update(id, request);
    }

    @GetMapping("/{id}")
    public MemberResponse getById(@PathVariable Long id) {
        return memberService.getById(id);
    }

    @GetMapping
    public List<MemberResponse> getAll() {
        return memberService.getAll();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        memberService.delete(id);
    }
}