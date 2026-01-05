package com.andrea360.backend.service;

import com.andrea360.backend.dto.member.CreateMemberRequest;
import com.andrea360.backend.dto.member.MemberResponse;
import com.andrea360.backend.dto.member.UpdateMemberRequest;

import java.util.List;

public interface MemberService {

    MemberResponse create(CreateMemberRequest request);

    MemberResponse update(Long id, UpdateMemberRequest request);

    MemberResponse getById(Long id);

    List<MemberResponse> getAll();

    void delete(Long id);
}
