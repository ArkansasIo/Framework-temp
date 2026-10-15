cmake_minimum_required(VERSION 3.25)
project(MLTAStudio VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(MLTA_STUDIO_ENABLE_QT "Build the Qt 6 desktop interface when Qt is available" ON)

if(MLTA_STUDIO_ENABLE_QT)
    find_package(Qt6 6.4 COMPONENTS Widgets QUIET)
endif()

if(Qt6_FOUND)
    qt_standard_project_setup()
    qt_add_executable(mlta_studio
        src/main.cpp
        src/main_window.cpp
        include/mlta_studio/main_window.hpp
    )
    target_include_directories(mlta_studio PRIVATE include)
    target_link_libraries(mlta_studio PRIVATE Qt6::Widgets)
    target_compile_definitions(mlta_studio PRIVATE MLTA_STUDIO_WITH_QT=1)
else()
    add_executable(mlta_studio src/main.cpp)
    message(STATUS "Qt 6 Widgets not found: building the MLTA Studio CLI bootstrap.")
endif()

if(MSVC)
    target_compile_options(mlta_studio PRIVATE /W4 /permissive-)
else()
    target_compile_options(mlta_studio PRIVATE -Wall -Wextra -Wpedantic -Wconversion -Wshadow)
endif()
