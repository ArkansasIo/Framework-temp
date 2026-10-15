#pragma once
#include <string_view>
namespace framework {
enum class LogLevel { debug, info, warn, error };
class Logger {
public:
    virtual ~Logger() = default;
    virtual void log(LogLevel level, std::string_view message) noexcept = 0;
};
class NullLogger final : public Logger {
public:
    void log(LogLevel, std::string_view) noexcept override {}
};
} // namespace framework
