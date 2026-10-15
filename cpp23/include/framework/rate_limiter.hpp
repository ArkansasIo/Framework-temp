#pragma once
#include <algorithm>
#include <chrono>
#include <mutex>
namespace framework {
class TokenBucket {
public:
    using Clock = std::chrono::steady_clock;
    TokenBucket(double capacity, double tokens_per_second)
        : capacity_(capacity > 0.0 ? capacity : 1.0),
          refill_rate_(tokens_per_second > 0.0 ? tokens_per_second : 0.0),
          tokens_(capacity_), last_refill_(Clock::now()) {}
    [[nodiscard]] bool try_consume(double amount = 1.0) {
        if (amount <= 0.0 || amount > capacity_) return false;
        std::lock_guard lock(mutex_);
        const auto now = Clock::now();
        const std::chrono::duration<double> elapsed = now - last_refill_;
        tokens_ = std::min(capacity_, tokens_ + elapsed.count() * refill_rate_);
        last_refill_ = now;
        if (tokens_ < amount) return false;
        tokens_ -= amount;
        return true;
    }
private:
    const double capacity_;
    const double refill_rate_;
    double tokens_;
    Clock::time_point last_refill_;
    std::mutex mutex_;
};
} // namespace framework
