package com.andrea360.backend.config;

import com.andrea360.backend.entity.*;
import com.andrea360.backend.entity.enums.EmployeeAuthRole;
import com.andrea360.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Component
@Profile("dev") // runs only in dev profile
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final ZoneId ZONE = ZoneId.of("Europe/Belgrade");

    private final LocationRepository locationRepository;
    private final EmployeeRepository employeeRepository;
    private final MemberRepository memberRepository;
    private final FitnessServiceRepository fitnessServiceRepository;
    private final SessionRepository sessionRepository;
    private final MemberCreditRepository memberCreditRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // idempotency guard
        String adminEmail = "admin@andrea360.com";
        if (employeeRepository.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }

        // 1) Locations
        Location bl = upsertLocation("Andrea360 Banja Luka", "Kralja Petra I 12, Banja Luka");
        Location pr = upsertLocation("Andrea360 Prijedor", "Kralja Aleksandra 7, Prijedor");

        // 2) Employees (1 admin + 2 trainers)
        Employee admin = createEmployee(
                "Andrea", "Admin", adminEmail, "065/111-111",
                "Administrator", EmployeeAuthRole.ADMIN,
                "Admin123!", bl
        );

        Employee trainer1 = createEmployee(
                "Mina", "Petrovic", "trainer1@andrea360.com", "065/222-222",
                "Trainer", EmployeeAuthRole.EMPLOYEE,
                "Test123!", bl
        );

        Employee trainer2 = createEmployee(
                "Viktor", "Markovic", "trainer2@andrea360.com", "065/333-333",
                "Trainer", EmployeeAuthRole.EMPLOYEE,
                "Test123!", pr
        );

        employeeRepository.saveAll(List.of(admin, trainer1, trainer2));

        // 3) Fitness services
        // NOTE: your FitnessService has unique name, so keep names stable + unique.
        FitnessService yogaBL = createService("Yoga Flow (BL)", "Relax + mobility", 60, new BigDecimal("10.00"), bl);
        FitnessService hiitBL = createService("HIIT Burn (BL)", "Cardio + strength", 45, new BigDecimal("12.00"), bl);
        FitnessService pilatesPR = createService("Pilates Core (PR)", "Core strength + posture", 60, new BigDecimal("11.00"), pr);

        fitnessServiceRepository.saveAll(List.of(yogaBL, hiitBL, pilatesPR));

        // 4) Members
        Member m1 = createMember("Ana", "Jovic", "ana@demo.com", "066/101-101", "Test123!", LocalDate.of(2001, 5, 12), bl);
        Member m2 = createMember("Luka", "Ilic", "luka@demo.com", "066/202-202", "Test123!", LocalDate.of(1998, 11, 2), bl);
        Member m3 = createMember("Sara", "Nikolic", "sara@demo.com", "066/303-303", "Test123!", LocalDate.of(2003, 2, 20), pr);

        memberRepository.saveAll(List.of(m1, m2, m3));

        // 5) Member credits (so they can book immediately)
        // You can adjust numbers however you want.
        seedCredits(m1, yogaBL, 5);
        seedCredits(m1, hiitBL, 3);
        seedCredits(m2, hiitBL, 4);
        seedCredits(m3, pilatesPR, 6);

        // 6) Sessions (next 10 days)
        seedSessionsForNextDays(bl, trainer1, yogaBL, 10, List.of(LocalTime.of(18, 0), LocalTime.of(19, 30)));
        seedSessionsForNextDays(bl, trainer1, hiitBL, 10, List.of(LocalTime.of(17, 0)));
        seedSessionsForNextDays(pr, trainer2, pilatesPR, 10, List.of(LocalTime.of(18, 0)));

        // If you want: seed reservations/payments too — but I recommend starting without them
        // because your booking/payment services might enforce extra logic.
    }

    private Location upsertLocation(String name, String address) {
        return locationRepository.findByNameAndAddress(name, address)
                .orElseGet(() -> locationRepository.save(
                        Location.builder().name(name).address(address).build()
                ));
    }

    private Employee createEmployee(
            String firstName,
            String lastName,
            String email,
            String phone,
            String jobRole,
            EmployeeAuthRole authRole,
            String rawPassword,
            Location location
    ) {
        Employee e = new Employee();
        e.setFirstName(firstName);
        e.setLastName(lastName);
        e.setEmail(email);
        e.setPhone(phone);
        e.setRole(jobRole);
        e.setAuthRole(authRole);
        e.setPasswordHash(passwordEncoder.encode(rawPassword));
        e.setLocation(location);
        return e;
    }

    private Member createMember(
            String firstName,
            String lastName,
            String email,
            String phone,
            String rawPassword,
            LocalDate dob,
            Location location
    ) {
        Member m = new Member();
        m.setFirstName(firstName);
        m.setLastName(lastName);
        m.setEmail(email);
        m.setPhone(phone);
        m.setPasswordHash(passwordEncoder.encode(rawPassword));
        m.setDateOfBirth(dob);
        m.setLocation(location);
        return m;
    }

    private FitnessService createService(
            String name,
            String description,
            int durationMinutes,
            BigDecimal price,
            Location location
    ) {
        FitnessService fs = new FitnessService();
        fs.setName(name);
        fs.setDescription(description);
        fs.setDurationMinutes(durationMinutes);
        fs.setPrice(price);
        fs.setActive(true);
        fs.setLocation(location);
        return fs;
    }

    private void seedCredits(Member member, FitnessService service, int credits) {
        memberCreditRepository.findByMemberIdAndFitnessServiceId(member.getId(), service.getId())
                .orElseGet(() -> {
                    MemberCredit mc = new MemberCredit();
                    mc.setMember(member);
                    mc.setFitnessService(service);
                    mc.setAvailableCredits(credits);
                    return memberCreditRepository.save(mc);
                });
    }

    private void seedSessionsForNextDays(
            Location location,
            Employee trainer,
            FitnessService service,
            int days,
            List<LocalTime> startTimes
    ) {
        OffsetDateTime now = OffsetDateTime.now(ZONE);

        for (int d = 0; d < days; d++) {
            LocalDate date = now.toLocalDate().plusDays(d);

            for (LocalTime startTime : startTimes) {
                OffsetDateTime startsAt = OffsetDateTime.of(date, startTime, now.getOffset());
                OffsetDateTime endsAt = startsAt.plusMinutes(service.getDurationMinutes());

                // don’t create sessions in the past (if you start late in the day)
                if (endsAt.isBefore(now)) continue;

                // avoid trainer overlap (you already have helper query)
                boolean overlap = sessionRepository.existsTrainerOverlap(
                        trainer.getId(), startsAt, endsAt, null
                );
                if (overlap) continue;

                Session s = new Session();
                s.setStartsAt(startsAt);
                s.setEndsAt(endsAt);
                s.setCapacity(12);
                s.setStatus("SCHEDULED"); // IMPORTANT: your queries expect lower(status) == 'scheduled'
                s.setLocation(location);
                s.setFitnessService(service);
                s.setTrainer(trainer);

                sessionRepository.save(s);
            }
        }
    }
}
