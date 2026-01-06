package com.andrea360.backend.service.implementation;

import com.andrea360.backend.dto.member.CreateMemberRequest;
import com.andrea360.backend.dto.member.MemberResponse;
import com.andrea360.backend.dto.member.UpdateMemberRequest;
import com.andrea360.backend.entity.Location;
import com.andrea360.backend.entity.Member;
import com.andrea360.backend.exception.BusinessException;
import com.andrea360.backend.exception.NotFoundException;
import com.andrea360.backend.repository.LocationRepository;
import com.andrea360.backend.repository.MemberRepository;
import com.andrea360.backend.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public MemberResponse create(CreateMemberRequest request) {
        if (memberRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BusinessException("Member with same email already exists.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));

        Member member = new Member();
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setLocation(location);
        member.setPasswordHash(passwordEncoder.encode(request.getPassword()));


        Member saved = memberRepository.save(member);
        return mapToResponse(saved);
    }

    @Override
    public MemberResponse update(Long id, UpdateMemberRequest request) {
        Member existing = memberRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Member not found: " + id));

        if (memberRepository.existsByEmailIgnoreCaseAndIdNot(request.getEmail(), id)) {
            throw new BusinessException("Member with same email already exists.");
        }

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));

        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setDateOfBirth(request.getDateOfBirth());
        existing.setLocation(location);

        Member saved = memberRepository.save(existing);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MemberResponse getById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Member not found: " + id));

        return mapToResponse(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberResponse> getAll() {
        return memberRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new NotFoundException("Member not found: " + id);
        }
        memberRepository.deleteById(id);
    }

    private MemberResponse mapToResponse(Member m) {
        return new MemberResponse(
                m.getId(),
                m.getFirstName(),
                m.getLastName(),
                m.getEmail(),
                m.getPhone(),
                m.getDateOfBirth(),
                m.getLocation().getId(),
                m.getLocation().getName()
        );
    }
}