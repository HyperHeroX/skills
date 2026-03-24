# Mobile & Cross-Platform Development Technical Capabilities Reference

> Source: `sample/multi-platform-apps/agents/flutter-expert.md`

## Flutter (3.x+)

### Core Mastery
- **Multi-platform**: Mobile, web, desktop, embedded
- **Rendering**: Impeller engine optimization
- **Design systems**: Material Design 3, Cupertino
- **Accessibility**: Semantic annotations

### Dart 3.x Features
- **Modern syntax**: Patterns, records, sealed classes
- **Null safety**: Strict mode, migration strategies
- **Async**: Future, Stream, Isolate
- **FFI**: C/C++ integration

### State Management
| Solution | Use Case |
|----------|----------|
| Riverpod 2.x | Compile-time safe providers |
| Bloc/Cubit | Event-driven business logic |
| GetX | Reactive with DI |
| Provider | Simple state sharing |
| Stacked | MVVM with service locator |

### Architecture Patterns
- Clean Architecture
- Feature-driven development
- MVVM, MVP, MVI
- Repository pattern
- Dependency injection (GetIt, Injectable)

### Platform Integration
- **iOS**: Swift channels, Cupertino widgets
- **Android**: Kotlin channels, Material Design 3
- **Web**: PWA, responsive design
- **Desktop**: Windows, macOS, Linux
- Platform channels (method, event, basic message)

### Performance
- Widget rebuild minimization
- Const constructors and keys
- Memory profiling (DevTools)
- List virtualization (Slivers)
- Isolates for CPU-intensive tasks
- 60/120fps optimization

### UI & Animation
- Custom animations (AnimationController, Tween)
- Implicit animations
- Hero and shared element transitions
- Rive and Lottie integration
- Custom painters
- Responsive/adaptive design

### Testing
| Type | Tools |
|------|-------|
| Unit | mockito, fake implementations |
| Widget | testWidgets, golden files |
| Integration | Patrol, custom drivers |
| Performance | Benchmarks, DevTools |
| Accessibility | Semantic finder |

### Data Management
- **Local**: SQLite, Hive, ObjectBox, Drift
- **Cloud**: Firebase, AWS, Google Cloud
- **Offline-first**: Sync patterns
- **APIs**: GraphQL (Ferry), REST (Dio)

### DevOps
- CI/CD: Codemagic, GitHub Actions, Bitrise
- Flavors and environments
- Code signing
- OTA updates
- Crash reporting

### Security
- Secure storage (keychain)
- Certificate pinning
- Biometric auth
- Code obfuscation
- GDPR compliance

---

## React Native

### Core Features
- JSX component model
- Bridge architecture
- Hermes JavaScript engine
- Fabric renderer
- TurboModules

### State Management
- Redux Toolkit
- Zustand
- MobX
- Recoil

### Navigation
- React Navigation
- Deep linking
- Tab/stack navigators

### Performance
- FlatList optimization
- Image caching
- Memory management
- Native modules

---

## Native Development

### iOS (Swift/SwiftUI)
- SwiftUI declarative UI
- Combine framework
- Core Data
- ARKit, CoreML
- App Store optimization

### Android (Kotlin)
- Jetpack Compose
- Coroutines
- Room database
- CameraX, ML Kit
- Play Store compliance

---

## Cross-Platform Considerations

### Code Sharing Strategies
| Strategy | Pros | Cons |
|----------|------|------|
| Full cross-platform | Max code reuse | Platform limitations |
| Shared logic + Native UI | Best UX | More development |
| Embedded web | Fastest development | Lower performance |

### Platform-Specific Features
- Push notifications
- Background processing
- Biometrics
- Camera/media
- Location services
- In-app purchases

### Distribution
- App Store (iOS)
- Play Store (Android)
- Beta testing (TestFlight, Firebase)
- Enterprise distribution
- OTA updates
