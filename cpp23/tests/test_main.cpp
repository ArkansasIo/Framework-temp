#include "framework/framework.hpp"

#include <cstdlib>
#include <iostream>

namespace {

int failures = 0;

void check(bool condition, const char* name) {
    if (condition) {
        std::cout << "[PASS] " << name << '\n';
    } else {
        std::cerr << "[FAIL] " << name << '\n';
        ++failures;
    }
}

void test_config() {
    const auto valid = framework::load_config({
        {"APP_NAME", "example"},
        {"NODE_ENV", "test"},
        {"PORT", "4321"},
        {"LOG_LEVEL", "debug"}
    });
    check(valid.has_value(), "valid configuration is accepted");
    if (valid) {
        check(valid.value().port == 4321, "port is parsed");
        check(valid.value().app_name == "example", "application name is parsed");
        check(valid.value().environment == framework::Environment::test, "environment is parsed");
    }

    check(!framework::load_config({{"PORT", "70000"}}), "out-of-range port is rejected");
    check(!framework::load_config({{"PORT", "12x"}}), "non-numeric port is rejected");
    check(!framework::load_config({{"NODE_ENV", "staging"}}), "unknown environment is rejected");
    check(!framework::load_config({{"LOG_LEVEL", "trace"}}), "unknown log level is rejected");
}

void test_validation() {
    const auto valid = framework::require_non_empty_string("hello", "name");
    check(valid && valid.value() == "hello", "non-empty string is accepted");
    check(!framework::require_non_empty_string("", "name"), "empty string is rejected");
    check(!framework::require_non_empty_string("toolong", "name", 3), "overlong string is rejected");
    check(!framework::require_non_empty_string("bad\nvalue", "name"), "control characters are rejected");
}

void test_lifecycle() {
    framework::Lifecycle lifecycle;
    check(lifecycle.state() == framework::LifecycleState::created, "lifecycle starts in created");
    check(lifecycle.transition(framework::LifecycleState::starting).has_value(), "created -> starting");
    check(lifecycle.transition(framework::LifecycleState::ready).has_value(), "starting -> ready");
    check(lifecycle.transition(framework::LifecycleState::stopping).has_value(), "ready -> stopping");
    check(lifecycle.transition(framework::LifecycleState::stopped).has_value(), "stopping -> stopped");
    check(!lifecycle.transition(framework::LifecycleState::ready), "stopped cannot return to ready");
}

} // namespace

int main() {
    test_config();
    test_validation();
    test_lifecycle();

    if (failures != 0) {
        std::cerr << failures << " test(s) failed.\n";
        return EXIT_FAILURE;
    }
    std::cout << "All framework tests passed.\n";
    return EXIT_SUCCESS;
}
