package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.BankingTransaction;
import com.cybershield.backend.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BankingTransactionRepository extends JpaRepository<BankingTransaction, UUID> {

    Optional<BankingTransaction> findByReference(String reference);

    List<BankingTransaction> findTop20ByUserOrderByRequestedAtDesc(AppUser user);

    List<BankingTransaction> findTop20ByOrderByRequestedAtDesc();

    long countByStatus(TransactionStatus status);

    boolean existsByUserAndAccountNumberAndStatusIn(AppUser user, String accountNumber, List<TransactionStatus> statuses);
}
