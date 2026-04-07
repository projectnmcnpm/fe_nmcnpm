# Spring Boot Skeleton Guide

This file gives ready-to-implement backend skeleton for Spring Boot.
Use this together with:

- docs/backend-springboot-postgresql-cloud-spec.md
- docs/backend/flyway/\*.sql

## 1. application.yml example

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hotel_db
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: UTC
  flyway:
    enabled: true
    locations: classpath:db/migration

app:
  cors:
    allowed-origins:
      - http://localhost:3000
  media:
    provider: cloudinary
    cloudinary:
      cloud-name: your_cloud_name
      api-key: your_api_key
      api-secret: your_api_secret
```

## 2. Common API envelope (optional)

```java
public record ApiResponse<T>(T data, String message) {
  public static <T> ApiResponse<T> of(T data) {
    return new ApiResponse<>(data, null);
  }
}
```

## 3. Room module skeleton

### Entity (excerpt)

```java
@Entity
@Table(name = "rooms")
public class RoomEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "room_code", nullable = false, unique = true)
  private String roomCode;

  @Column(nullable = false)
  private String name;

  @Column(name = "room_type", nullable = false)
  private String roomType;

  @Column(nullable = false)
  private BigDecimal price;

  @Column(name = "price_per_hour")
  private BigDecimal pricePerHour;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private RoomStatus status;

  @Column(name = "cover_image_url", nullable = false)
  private String coverImageUrl;

  @Column(columnDefinition = "text")
  private String description;
}
```

### Enum

```java
public enum RoomStatus {
  available, few_left, full, cleaning
}
```

### Repository

```java
public interface RoomRepository extends JpaRepository<RoomEntity, Long> {
  Optional<RoomEntity> findByRoomCode(String roomCode);

  @Query("""
    select r from RoomEntity r
    where (:status is null or r.status = :status)
      and (:search is null or lower(r.name) like lower(concat('%', :search, '%'))
           or lower(r.roomCode) like lower(concat('%', :search, '%')))
  """)
  List<RoomEntity> search(@Param("status") RoomStatus status, @Param("search") String search);
}
```

### Controller endpoints

```java
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
  private final RoomService roomService;

  @GetMapping
  public List<RoomResponse> getRooms(
      @RequestParam(required = false) RoomStatus status,
      @RequestParam(required = false) String search
  ) {
    return roomService.getRooms(status, search);
  }

  @GetMapping("/{id}")
  public RoomResponse getRoom(@PathVariable("id") String roomCode) {
    return roomService.getRoomByCode(roomCode);
  }

  @PatchMapping("/{id}/status")
  public RoomResponse updateStatus(@PathVariable("id") String roomCode,
                                   @RequestBody UpdateRoomStatusRequest body) {
    return roomService.updateStatus(roomCode, body.status());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteRoom(@PathVariable("id") String roomCode) {
    roomService.deleteRoom(roomCode);
  }
}
```

## 4. Booking module skeleton

### Enum

```java
public enum BookingStatus {
  upcoming, active, completed, cancelled
}

public enum BookingType {
  day, hour
}
```

### Request DTO

```java
public record CreateBookingRequest(
    @NotBlank String roomId,
    String roomName,
    @NotBlank String userId,
    String customerPhone,
    String customerIdNumber,
    @NotNull LocalDate checkIn,
    @NotNull LocalDate checkOut,
    LocalTime checkInTime,
    LocalTime checkOutTime,
    BookingType bookingType,
    @NotNull @DecimalMin("0") BigDecimal total,
    BookingStatus status,
    String image,
    String paymentMethod,
    String paymentAmount,
    String cancelReason
) {}
```

### Status update DTO

```java
public record UpdateBookingStatusRequest(@NotNull BookingStatus status) {}
public record CancelBookingRequest(String reason) {}
```

### Controller endpoints

```java
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
  private final BookingService bookingService;

  @GetMapping
  public List<BookingResponse> getBookings(
      @RequestParam(required = false) String userId,
      @RequestParam(required = false) BookingStatus status,
      @RequestParam(required = false) String roomId
  ) {
    return bookingService.getBookings(userId, status, roomId);
  }

  @GetMapping("/{id}")
  public BookingResponse getBooking(@PathVariable("id") String bookingCode) {
    return bookingService.getByCode(bookingCode);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public BookingResponse create(@Valid @RequestBody CreateBookingRequest request) {
    return bookingService.create(request);
  }

  @PatchMapping("/{id}/status")
  public BookingResponse updateStatus(@PathVariable("id") String bookingCode,
                                      @Valid @RequestBody UpdateBookingStatusRequest request) {
    return bookingService.updateStatus(bookingCode, request.status());
  }

  @PatchMapping("/{id}/cancel")
  public BookingResponse cancel(@PathVariable("id") String bookingCode,
                                @RequestBody CancelBookingRequest request) {
    return bookingService.cancel(bookingCode, request.reason());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String bookingCode) {
    bookingService.delete(bookingCode);
  }
}
```

### Booking service transition guard (core rule)

```java
private void validateTransition(BookingStatus from, BookingStatus to) {
  if (from == BookingStatus.completed || from == BookingStatus.cancelled) {
    throw new ConflictException("Final status cannot be changed");
  }
  if (from == BookingStatus.upcoming && (to == BookingStatus.active || to == BookingStatus.cancelled)) return;
  if (from == BookingStatus.active && (to == BookingStatus.completed || to == BookingStatus.cancelled)) return;
  if (from == to) return;
  throw new ConflictException("Invalid booking status transition");
}
```

## 5. Account module skeleton

### Enums

```java
public enum AccountRole { manager, receptionist, cleaner, customer }
public enum AccountStatus { active, disabled }
```

### Controller endpoints

```java
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
  private final AccountService accountService;

  @GetMapping
  public List<AccountResponse> getAccounts() { return accountService.getAll(); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public AccountResponse create(@Valid @RequestBody CreateAccountRequest request) {
    return accountService.create(request);
  }

  @PatchMapping("/{id}")
  public AccountResponse update(@PathVariable("id") String accountCode,
                                @RequestBody UpdateAccountRequest request) {
    return accountService.update(accountCode, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String accountCode) {
    accountService.delete(accountCode);
  }
}
```

## 6. Customer module skeleton

### Controller endpoints

```java
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
  private final CustomerService customerService;

  @GetMapping
  public List<CustomerResponse> getCustomers() { return customerService.getAll(); }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CustomerResponse create(@Valid @RequestBody CreateCustomerRequest request) {
    return customerService.create(request);
  }

  @PatchMapping("/{id}")
  public CustomerResponse update(@PathVariable("id") String customerCode,
                                 @RequestBody UpdateCustomerRequest request) {
    return customerService.update(customerCode, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable("id") String customerCode) {
    customerService.delete(customerCode);
  }
}
```

## 7. Media upload (Cloudinary example)

### Endpoint

```java
@PostMapping(value = "/api/media/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public MediaUploadResponse upload(@RequestParam("file") MultipartFile file) {
  return cloudStorageService.upload(file);
}
```

### Response

```json
{
  "url": "https://res.cloudinary.com/.../image/upload/v123/example.jpg",
  "publicId": "example"
}
```

Store `url` to DB fields:

- rooms.cover_image_url
- room_images.image_url
- bookings.image_url snapshot if needed

## 8. Global exception handler skeleton

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
    // map field errors
  }

  @ExceptionHandler(NotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorResponse handleNotFound(NotFoundException ex, HttpServletRequest req) { }

  @ExceptionHandler(ConflictException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ErrorResponse handleConflict(ConflictException ex, HttpServletRequest req) { }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ErrorResponse handleAny(Exception ex, HttpServletRequest req) { }
}
```

## 9. Backend ready checklist

1. Flyway migrations run without error.
2. Swagger shows all endpoints in docs/api-contract.md.
3. FE env set:
   - NEXT_PUBLIC_USE_MOCK_DATA=false
   - NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
4. FE pages load and mutate data successfully.
5. Status transition tests pass.
6. Upload image endpoint returns stable cloud URL.
