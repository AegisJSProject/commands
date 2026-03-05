<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.0.2] - 2026-03-05

### Added
- Add `title`, `description`, and `url` to `share` in root commands

### Changed
- Update node to 24.10.0
- Update npm publishing
- Update dependencies

## [v1.0.1] - 2025-10-08

### Added
- Add commands registry for `document.documentElement` / `<html>` / `:root` / `:host`
- Add support for passing arguments with command via `--command:arg1:arg2:...:argn`
- Add predefined command for adding/removing classes

### Changed
- Use `event.preventDefault()` and `event.stopImmediatePropagation()` for handled events

## [v1.0.0] - 2025-09-28

Initial Release
