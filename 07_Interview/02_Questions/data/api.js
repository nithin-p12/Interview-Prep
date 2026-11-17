QB.cat({id:'api',name:'APIs, Security & Auth',short:'APIs & Security',icon:'🔐',col:'indigo'},[
{q:'Keycloak basics — what is it and how do you integrate it with Spring Boot?',a:[
 `Keycloak is an open-source **identity and access management** server. It handles login, user management, SSO, MFA, social login and roles, and issues tokens using standard **OAuth 2.0 and OpenID Connect** — so my services never store passwords or write login code.`,
 `Integration: the frontend redirects the user to Keycloak to log in and gets back an access token, a JWT. My Spring Boot services are **resource servers** — I add \`spring-boot-starter-oauth2-resource-server\` and set \`spring.security.oauth2.resourceserver.jwt.issuer-uri\` to the realm URL. Spring then downloads Keycloak's public keys and validates every token's signature, expiry and issuer locally. Then I map Keycloak roles to authorities and protect endpoints with \`@PreAuthorize\`.`]},
{q:'OAuth 2.0 in detail — roles, grant types and flow',a:[
 `OAuth 2.0 is an **authorization** framework — it lets a client access a resource on a user's behalf without ever seeing the user's password. **OpenID Connect** sits on top and adds authentication, with an ID token.`,
 `There are four roles: the **resource owner** (the user), the **client** (the app), the **authorization server** (Keycloak, Okta), and the **resource server** (my API).`,
 `Grant types: **Authorization Code with PKCE** for web and mobile apps, where the user logs in at the auth server and the app swaps a short-lived code for tokens; **Client Credentials** for service-to-service calls with no user; and the **Refresh Token** grant to get a new access token without logging in again. Implicit and password grants are deprecated.`,
 `The flow: the app redirects to the auth server → the user logs in and consents → the app gets a code → it exchanges the code for an **access token** (short-lived, sent as \`Authorization: Bearer\`) and a **refresh token** → the API validates the token and checks scopes and roles.`]},
{q:'What are realms in Keycloak?',a:[
 `A **realm** is an isolated tenant inside Keycloak — it has its own users, roles, clients, login settings, password policies and signing keys. Users in one realm can't see or log into another. The \`master\` realm is only for administering Keycloak itself.`,
 `Inside a realm you have **clients** (each app or service registered to use it — a public client for the frontend, a confidential client with a secret for backends), **realm roles** shared across the realm, **client roles** specific to one app, and **groups** to assign roles in bulk. Typically we create one realm per environment or per customer organisation for multi-tenant products.`]},
{q:'JWT authentication flow — how do you secure REST APIs with JWT?',c:['KPMG'],a:[
 `A JWT has three parts — header, payload with claims like user id, roles and expiry, and a **signature**. The user logs in once, the auth server signs a token and returns it, and the client sends it on every call as \`Authorization: Bearer <token>\`.`,
 `On each request, my API verifies the signature with the public key, checks expiry and issuer, then reads the roles from the claims — no session and no DB lookup, so it's **stateless** and scales horizontally. In Spring that's the OAuth2 resource server plus \`@PreAuthorize\`.`,
 `Key considerations: keep access tokens **short-lived** with refresh tokens, use RS256 so services need only the public key, don't put sensitive data in the payload because it's only Base64-encoded, and always use HTTPS. Revocation is the weak spot — short expiry or a denylist in Redis handles it.`]},
{q:'How do you configure security in a Spring Boot application?',c:['ITC Infotech'],a:[
 `In Spring Security 6 I define a \`SecurityFilterChain\` bean instead of extending the old \`WebSecurityConfigurerAdapter\`. In it I disable CSRF for stateless REST APIs, set sessions to \`STATELESS\`, define URL rules — public endpoints like \`/actuator/health\` and login, \`hasRole("ADMIN")\` for admin paths, \`authenticated()\` for the rest — and enable JWT validation with \`oauth2ResourceServer\`.`,
 `Then I add \`@EnableMethodSecurity\` for fine-grained \`@PreAuthorize\` checks on methods, configure CORS for the frontend, and return proper 401/403 responses through an entry point and access-denied handler.`],
 code:`@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  return http.csrf(c -> c.disable())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .authorizeHttpRequests(a -> a
      .requestMatchers("/actuator/health").permitAll()
      .requestMatchers("/admin/**").hasRole("ADMIN")
      .anyRequest().authenticated())
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
    .build();
}`},
{q:'How do you pass a JWT token from one service to another?',c:['ITC Infotech'],a:[
 `If the downstream call is **on behalf of the user**, I propagate the same token: read it from the \`SecurityContext\` and set it as the \`Authorization: Bearer\` header on the outgoing call — with a Feign \`RequestInterceptor\`, or a \`WebClient\` filter / \`ServerOAuth2AuthorizedClientExchangeFilterFunction\`. That way service B sees the same user and roles.`,
 `If it's a **system call** with no user, like a scheduled job or a Kafka consumer, the service gets its own token with the **client credentials** grant and uses that. For Kafka there's no header chain, so I put the user id in the event itself if downstream needs it.`]},
{q:'How do you secure service-to-service communication?',c:['Deloitte'],a:[
 `Two layers. **Authentication of the caller**: each service gets its own identity via the OAuth2 **client credentials** grant, sends a token, and the receiving service validates it and checks scopes — like \`orders.read\`. Or I propagate the user's JWT when acting on their behalf.`,
 `**Transport**: everything over TLS, and ideally **mutual TLS**, where both sides present certificates — usually handled by a service mesh like Istio without touching code. On top of that, keep internal services off the public network, expose only the API Gateway, and use network policies so only allowed services can talk to each other. Secrets come from Vault or AWS Secrets Manager, never from code.`]},
{q:'Only Admins may call saveRecord, while everyone can call viewRecord — how? Which annotation is used for RBAC?',c:['Tech Lead'],a:[
 `I enable \`@EnableMethodSecurity\` and annotate the methods: \`@PreAuthorize("hasRole('ADMIN')")\` on \`saveRecord\` and \`@PreAuthorize("hasAnyRole('USER','ADMIN')")\` — or just authenticated — on \`viewRecord\`. Roles come from the JWT, e.g. Keycloak realm roles mapped to \`ROLE_ADMIN\` authorities.`,
 `\`@PreAuthorize\` is the go-to for RBAC because it supports expressions — even ownership checks like \`#userId == authentication.name\`. \`@Secured("ROLE_ADMIN")\` and \`@RolesAllowed\` also work but only take plain role names. The same rule can also live in the \`SecurityFilterChain\` by URL and HTTP method.`]},
{q:'How do you store sensitive customer data like account information in the database?',a:[
 `First, **don't store what you don't need** — for card data, keep only a token from the payment gateway and the last four digits, which keeps us out of most PCI scope.`,
 `For what we must store, like account numbers or PAN: **encrypt at field level** with AES-256-GCM, using a JPA \`AttributeConverter\` or MongoDB client-side field-level encryption, with keys in a KMS like AWS KMS or Vault — never in the code or the same DB. Passwords are never encrypted, only **hashed** with BCrypt or Argon2.`,
 `On top: encryption at rest and TLS in transit, **masking** in API responses and logs (\`XXXX1234\`), least-privilege DB access, and audit logs of who read what.`]},
{q:'REST API idempotency — the same payment request arrives multiple times, or the user retries after a timeout. How do you prevent duplicate processing?',a:[
 `GET, PUT and DELETE are naturally idempotent, but POST is not — so for payments and orders the client sends an **Idempotency-Key** header, a UUID generated once per user action and reused on every retry.`,
 `On the server, before processing, I try to store that key with status \`IN_PROGRESS\` — using a **unique constraint** in the DB or Redis \`SET NX\` with a TTL. If the insert succeeds, I process and save the final response against the key. If the key already exists, I don't process again — I return the stored response, or 409 if it's still in progress. The atomic insert also solves the race when two duplicate requests arrive at the same millisecond.`,
 `As a second safety net, a unique business constraint — like one payment per order id — and the payment gateway's own idempotency key. Consumers of Kafka events use the same trick with the event id.`]},
{q:'How do you version and secure one REST API used by mobile, web and partners — without breaking old clients, e.g. when renaming a field?',c:['Persistent'],a:[
 `**Versioning**: I use URI versioning — \`/api/v1/orders\`, \`/api/v2/orders\` — because it's explicit and easy to route at the gateway; header or media-type versioning also works. But the main rule is to **avoid breaking changes**: adding fields is safe, removing or renaming is not.`,
 `So a rename ships in steps: **add** the new field and keep sending the old one, mark the old one deprecated in the OpenAPI docs, watch logs and metrics until old app versions are gone — mobile users update slowly — then remove it in the next major version. Breaking changes go to v2, and v1 runs in parallel with a published sunset date.`,
 `**Security**: everything through an API Gateway with OAuth2. Mobile and web use Authorization Code with PKCE and user tokens; partners use client credentials with **scopes** limiting what they can call, separate rate limits and quotas per client, and maybe mTLS or IP allow-listing for partners.`]},
{q:'Users are abusing your API — how do you implement rate limiting?',a:[
 `I limit requests per client — by user id, API key or IP — using a **token bucket**: each client has a bucket that refills at a fixed rate, every request takes a token, and when it's empty the API returns **429 Too Many Requests** with a \`Retry-After\` header.`,
 `Since we run many instances, the counters must be shared, so I keep them in **Redis**. The easiest place is the API Gateway — Spring Cloud Gateway's \`RequestRateLimiter\` with Redis does exactly this — or Bucket4j or Resilience4j \`RateLimiter\` in the service. I use different limits per plan or endpoint (login gets a strict limit against brute force), and add a WAF or CDN rules for real abuse like bots and DDoS.`]},
{q:'HTTP methods — PUT vs PATCH vs POST, and common status codes',a:[
 `**POST** creates a resource or triggers an action — not idempotent. **PUT** replaces the whole resource at a known URI — idempotent; send the same PUT twice and you get the same result. **PATCH** updates only the fields sent — partial update. **GET** reads, **DELETE** removes; both idempotent.`,
 `Status codes I use: **200** OK, **201** Created (with a Location header), **204** No Content; **400** bad input, **401** not authenticated, **403** authenticated but not allowed, **404** not found, **409** conflict like a duplicate or version clash, **422** validation failed, **429** too many requests; **500** server bug, **502/503** downstream or service unavailable, **504** gateway timeout.`]},
]);
