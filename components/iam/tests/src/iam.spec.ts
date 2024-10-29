import { test, expect, request } from "@playwright/test";

const randomCreateRealmName = (Math.random() + 1).toString(36).substring(7);
const randomUpdateRealmName = (Math.random() + 1).toString(36).substring(10);
const randomCreateFlowName =
  (Math.random() + 1).toString(36).substring(10) + "flow";

const getCommonHeaders = (authToken: string) => ({
  Authorization: `Bearer ${authToken}`,
  "Content-Type": "application/json",
});

test.describe("API Endpoint Tests", () => {
  let authToken = "";

  test("GET user token", async ({request, baseURL}) => {
    // Make GET request to an API endpoint with authorization header
    console.log("Link ", `${baseURL}/iam/realms/master/protocol/openid-connect/token`);
    const tokenResponse = await request.post(
      `${baseURL}/iam/realms/master/protocol/openid-connect/token`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        form: {
          client_id: "admin-cli",
          username: "admin",
          password: "xfsc4Ntt!",
          grant_type: "password",
        },
      }
    );

    // Validate status code
    expect(tokenResponse.status()).toBe(200);

    // Validate response body if it containes access token
    const tokenResponseBody = await tokenResponse.json();
    expect(tokenResponseBody).toHaveProperty("access_token");
    authToken = tokenResponseBody.access_token;
  });

  test('GET list of realms of "master" realm', async ({request, baseURL}) => {
    // Make GET request to an API endpoint with authorization header
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/ui-ext/realms?`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body
    const responseBody = await response.json();

    // Check if the response body is a list (an array)
    expect(Array.isArray(responseBody)).toBe(true);
  });

  test("GET list of realms", async ({request, baseURL}) => {
    // Make GET request to an API endpoint with authorization header
    const response = await request.get(`${baseURL}/iam/admin/realms`, {
      headers: getCommonHeaders(authToken),
    });

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body
    const responseBody = await response.json();

    // Check if the response body is a list (an array)
    expect(Array.isArray(responseBody)).toBe(true);
  });

  test("Get admin server info", async ({request, baseURL}) => {
    // Make POST request with authorization and payload
    const response = await request.get(`${baseURL}/iam/admin/serverinfo`, {
      headers: getCommonHeaders(authToken),
    });

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("systemInfo");
  });

  test('Get current user of "master" realm ', async ({request, baseURL}) => {
    // Make GET request with authorization and payload to get the current user od master realm
    const response = await request.get(
      `${baseURL}/iam/admin/${"master"}/console/whoami?currentRealm=${"master"}`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("userId");
  });

  test('Get current user of "gaia-x" realm ', async ({request, baseURL}) => {
    // Make GET request with authorization and payload to get the current user od master realm
    const response = await request.get(
      `${baseURL}/iam/admin/${"master"}/console/whoami?currentRealm=gaia-x`,
      {
        headers: getCommonHeaders(authToken), 
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("userId");
  });

  test("Create a new enabled realm", async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.post(`${baseURL}/iam/admin/realms`, {
      headers: getCommonHeaders(authToken),
      data: {
        realm: randomCreateRealmName,
        enabled: true,
      },
    });

    // Validate status code
    expect(response.status()).toBe(201);
  });

  test("Update an existing realm", async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const bodyRequest = {
      id: randomUpdateRealmName,
      realm: randomUpdateRealmName,
      notBefore: 0,
      defaultSignatureAlgorithm: "RS256",
      revokeRefreshToken: false,
      refreshTokenMaxReuse: 0,
      accessTokenLifespan: 300,
      accessTokenLifespanForImplicitFlow: 900,
      ssoSessionIdleTimeout: 1800,
      ssoSessionMaxLifespan: 36000,
      ssoSessionIdleTimeoutRememberMe: 0,
      ssoSessionMaxLifespanRememberMe: 0,
      offlineSessionIdleTimeout: 2592000,
      offlineSessionMaxLifespanEnabled: false,
      offlineSessionMaxLifespan: 5184000,
      clientSessionIdleTimeout: 0,
      clientSessionMaxLifespan: 0,
      clientOfflineSessionIdleTimeout: 0,
      clientOfflineSessionMaxLifespan: 0,
      accessCodeLifespan: 60,
      accessCodeLifespanUserAction: 300,
      accessCodeLifespanLogin: 1800,
      actionTokenGeneratedByAdminLifespan: 43200,
      actionTokenGeneratedByUserLifespan: 300,
      oauth2DeviceCodeLifespan: 600,
      oauth2DevicePollingInterval: 5,
      enabled: true,
      sslRequired: "external",
      registrationAllowed: false,
      registrationEmailAsUsername: false,
      rememberMe: false,
      verifyEmail: false,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: false,
      editUsernameAllowed: false,
      bruteForceProtected: false,
      permanentLockout: false,
      maxFailureWaitSeconds: 900,
      minimumQuickLoginWaitSeconds: 60,
      waitIncrementSeconds: 60,
      quickLoginCheckMilliSeconds: 1000,
      maxDeltaTimeSeconds: 43200,
      failureFactor: 30,
      defaultRole: {
        id: "254cc584-dbbf-450f-b1a8-8bebfa7d7dcf",
        name: "default-roles-playwright",
        description: "${role_default-roles}",
        composite: true,
        clientRole: false,
        containerId: "e21ca331-00da-4ea8-957e-948c49ab62d4",
      },
      requiredCredentials: ["password"],
      otpPolicyType: "totp",
      otpPolicyAlgorithm: "HmacSHA1",
      otpPolicyInitialCounter: 0,
      otpPolicyDigits: 6,
      otpPolicyLookAheadWindow: 1,
      otpPolicyPeriod: 30,
      otpPolicyCodeReusable: false,
      otpSupportedApplications: [
        "totpAppFreeOTPName",
        "totpAppGoogleName",
        "totpAppMicrosoftAuthenticatorName",
      ],
      webAuthnPolicyRpEntityName: "keycloak",
      webAuthnPolicySignatureAlgorithms: ["ES256"],
      webAuthnPolicyRpId: "",
      webAuthnPolicyAttestationConveyancePreference: "not specified",
      webAuthnPolicyAuthenticatorAttachment: "not specified",
      webAuthnPolicyRequireResidentKey: "not specified",
      webAuthnPolicyUserVerificationRequirement: "not specified",
      webAuthnPolicyCreateTimeout: 0,
      webAuthnPolicyAvoidSameAuthenticatorRegister: false,
      webAuthnPolicyAcceptableAaguids: [],
      webAuthnPolicyExtraOrigins: [],
      webAuthnPolicyPasswordlessRpEntityName: "keycloak",
      webAuthnPolicyPasswordlessSignatureAlgorithms: ["ES256"],
      webAuthnPolicyPasswordlessRpId: "",
      webAuthnPolicyPasswordlessAttestationConveyancePreference:
        "not specified",
      webAuthnPolicyPasswordlessAuthenticatorAttachment: "not specified",
      webAuthnPolicyPasswordlessRequireResidentKey: "not specified",
      webAuthnPolicyPasswordlessUserVerificationRequirement: "not specified",
      webAuthnPolicyPasswordlessCreateTimeout: 0,
      webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister: false,
      webAuthnPolicyPasswordlessAcceptableAaguids: [],
      webAuthnPolicyPasswordlessExtraOrigins: [],
      browserSecurityHeaders: {
        contentSecurityPolicyReportOnly: "",
        xContentTypeOptions: "nosniff",
        referrerPolicy: "no-referrer",
        xRobotsTag: "none",
        xFrameOptions: "SAMEORIGIN",
        contentSecurityPolicy:
          "frame-src 'self'; frame-ancestors 'self'; object-src 'none';",
        xXSSProtection: "1; mode=block",
        strictTransportSecurity: "max-age=31536000; includeSubDomains",
      },
      smtpServer: {},
      eventsEnabled: false,
      eventsListeners: ["jboss-logging"],
      enabledEventTypes: [],
      adminEventsEnabled: false,
      adminEventsDetailsEnabled: false,
      identityProviders: [],
      identityProviderMappers: [],
      internationalizationEnabled: false,
      supportedLocales: [],
      browserFlow: "browser",
      registrationFlow: "registration",
      directGrantFlow: "direct grant",
      resetCredentialsFlow: "reset credentials",
      clientAuthenticationFlow: "clients",
      dockerAuthenticationFlow: "docker auth",
      attributes: {
        frontendUrl: "",
        "acr.loa.map": "{}",
        cibaBackchannelTokenDeliveryMode: "poll",
        cibaExpiresIn: "120",
        cibaAuthRequestedUserHint: "login_hint",
        oauth2DeviceCodeLifespan: "600",
        oauth2DevicePollingInterval: "5",
        parRequestUriLifespan: "60",
        cibaInterval: "5",
        realmReusableOtpCode: "false",
      },
      userManagedAccessAllowed: false,
      clientProfiles: {
        profiles: [],
      },
      clientPolicies: {
        policies: [],
      },
      displayName: "",
      displayNameHtml: "",
    };
    const response = await request.put(
      `${baseURL}/iam/admin/realms/${randomCreateRealmName}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        data: bodyRequest,
      }
    );

    // Validate status code
    expect(response.status()).toBe(204);
  });

  test("export an existing realm", async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.post(
      `${baseURL}/iam/admin/realms/${randomUpdateRealmName}/partial-export?exportClients=false&exportGroupsAndRoles=false`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test("delete an existing realm", async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.delete(
      `${baseURL}/iam/admin/realms/${randomUpdateRealmName}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Validate status code
    expect(response.status()).toBe(204);
  });

  test('get "master" realm', async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.get(`${baseURL}/iam/admin/realms/${"master"}`, {
      headers: getCommonHeaders(authToken),
    });

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test('get "master" realm authentication details', async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/authentication/required-actions`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test('get "master" realm authentication unregistered required actions details', async ({
    request, baseURL
  }) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/authentication/unregistered-required-actions`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test('get "master" realm authentication flows', async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/authentication/flows`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);
  });

  test('create "master" realm authentication flows', async ({request, baseURL}) => {
    // Make POST request to an API endpoint with authorization header
    const response = await request.post(
      `${baseURL}/iam/admin/realms/${"master"}/authentication/flows`,
      {
        headers: getCommonHeaders(authToken),
        data: {
          alias: randomCreateFlowName,
          description: "Help text for the description of the new flow",
          providerId: "basic-flow",
          builtIn: false,
          topLevel: true,
        },
      }
    );

    // Validate status code
    expect(response.status()).toBe(201);
  });

  test('copy "master" realm authentication flows', async ({request, baseURL}) => {
    const response = await request.post(
      `${baseURL}/iam/admin/realms/${"master"}/authentication/flows/${randomCreateFlowName}/copy`,
      {
        headers: getCommonHeaders(authToken),
        data: {
          newName: `Copy of ${randomCreateFlowName}`,
        },
      }
    );

    // Validate status code
    expect(response.status()).toBe(201);
  });

  // test("copy an existing authentication flow", async ({request, baseURL}) => {
  //   // Make POST request to an API endpoint with authorization header
  //   const response = await request.post(
  //     `${baseURL}/iam/admin/realms/${"master"}/authentication/flows/${randomCreateFlowName}/copy`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //         "Content-Type": "application/json",
  //       },
  //       data: {
  //         newName: `Copy of ${randomCreateFlowName}`,
  //       },
  //     }
  //   );

  //   // Validate status code
  //   expect(response.status()).toBe(201);
  // });

  // test("update an existing authentication flow test", async ({request, baseURL}) => {
  //   // Make POST request to an API endpoint with authorization header
  //   const flowsResponse = await request.get(
  //     `${baseURL}/iam/admin/realms/${"master"}/authentication/flows`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  //   const flowsResponseBody = await flowsResponse.json();
  //   const lastCreatedFlow = flowsResponseBody[-1];
  //   console.log("lastCreatedFlow", lastCreatedFlow);

  //   const response = await request.put(
  //     `${baseURL}/iam/admin/realms/${"master"}/authentication/flows/${
  //       lastCreatedFlow.id
  //     }`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //         "Content-Type": "application/json",
  //       },
  //       data: {
  //         id: lastCreatedFlow.id,
  //         alias: `Copy of ${randomCreateFlowName}`,
  //         description:
  //           "copy of Help text for the description of the new flow",
  //         providerId: "basic-flow",
  //         topLevel: true,
  //         builtIn: false,
  //         authenticationExecutions: [],
  //       },
  //     }
  //   );

  //   // Validate status code
  //   expect(response.status()).toBe(202);
  // });

  test('get "master" realm clients list', async ({request, baseURL}) => {
    const pagination = 1 + 10 * 1; // first page, 21 second page, 31 third page
    const filteredClient = "admin";
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/clients?first=0&max=${pagination}&clientId=${filteredClient}&search=true`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body if it is an array
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
  });

  test('get "master" realm clients initial access token', async ({
    request, baseURL
  }) => {
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/clients-initial-access`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body if it is an array
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
  });

  let createdInitialAccess;
  test('create new "master" realm initial access token', async ({
    request, baseURL
  }) => {
    const initialAccessTokenCreated = {
      expiration: 86400,
      count: 1,
    };
    const response = await request.post(
      `${baseURL}/iam/admin/realms/${"master"}/clients-initial-access`,
      {
        headers: getCommonHeaders(authToken),
        data: initialAccessTokenCreated,
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    createdInitialAccess = responseBody;
  });

  test('delete a "master" realm initial access token', async ({request, baseURL}) => {
    if (createdInitialAccess) {
      const response = await request.delete(
        `${baseURL}/iam/admin/realms/${"master"}/clients-initial-access/${
          createdInitialAccess.id
        }`,
        {
          headers: getCommonHeaders(authToken),
        }
      );
      // Validate status code
      expect(response.status()).toBe(204);
    }
  });

  test('get "master" realm clients registrations', async ({request, baseURL}) => {
    const response = await request.get(
      `${baseURL}/iam/admin/realms/${"master"}/components?type=org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy`,
      {
        headers: getCommonHeaders(authToken),
      }
    );

    // Validate status code
    expect(response.status()).toBe(200);

    // Validate response body if it is an array
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBe(true);
  });

  test('create new "master" realm client', async ({request, baseURL}) => {
    const randomCreatedClientId =
      (Math.random() + 1).toString(36).substring(10) + "client-id-create-test";
    const clientCreated = {
      protocol: "openid-connect",
      clientId: randomCreatedClientId,
      name: "",
      description: "",
      publicClient: true,
      authorizationServicesEnabled: false,
      serviceAccountsEnabled: false,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
      standardFlowEnabled: true,
      frontchannelLogout: true,
      attributes: {
        saml_idp_initiated_sso_url_name: "",
        "oauth2.device.authorization.grant.enabled": false,
        "oidc.ciba.grant.enabled": false,
      },
      alwaysDisplayInConsole: true,
      rootUrl: "",
      baseUrl: "",
    };
    const response = await request.post(
      `${baseURL}/iam/admin/realms/${"master"}/clients`,
      {
        headers: getCommonHeaders(authToken),
        data: clientCreated,
      }
    );

    // Validate status code
    expect(response.status()).toBe(201);
  });

  test('import new "master" realm client', async ({request, baseURL}) => {
    const importedClientName =
      (Math.random() + 1).toString(36).substring(7) + "-client-id-import-test";
    const clientImport = {
      clientId: importedClientName,
      name: "${client_account}",
      rootUrl: "${authBaseUrl}",
      baseUrl: `/realms/master/${importedClientName}/`,
      surrogateAuthRequired: false,
      enabled: true,
      alwaysDisplayInConsole: false,
      clientAuthenticatorType: "client-secret",
      redirectUris: [`/realms/master/${importedClientName}/*`],
      webOrigins: [],
      notBefore: 0,
      bearerOnly: false,
      consentRequired: false,
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: false,
      serviceAccountsEnabled: false,
      publicClient: true,
      frontchannelLogout: false,
      protocol: "openid-connect",
      attributes: {
        "post.logout.redirect.uris": "+",
        "oauth2.device.authorization.grant.enabled": false,
        "oidc.ciba.grant.enabled": false,
      },
      authenticationFlowBindingOverrides: {},
      fullScopeAllowed: false,
      nodeReRegistrationTimeout: 0,
      defaultClientScopes: ["web-origins", "acr", "roles", "profile", "email"],
      optionalClientScopes: [
        "address",
        "phone",
        "offline_access",
        "microprofile-jwt",
      ],
      access: {
        view: true,
        configure: true,
        manage: true,
      },
      description: "",
      authorizationServicesEnabled: false,
    };
    const response = await request.post(
      `${baseURL}/iam/admin/realms/${"master"}/clients`,
      {
        headers: getCommonHeaders(authToken),
        data: clientImport,
      }
    );

    // Validate status code
    expect(response.status()).toBe(201);
  });

  // test('delete "master" realm client', async ({request, baseURL}) => {
  //   const clientId = "f412135a-cb5e-4ba2-8bcf-f265bbc34898";
  //   const response = await request.delete(
  //     `${baseURL}/iam/admin/realms/${"master"}/clients/${clientId}`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   // Validate status code
  //   expect(response.status()).toBe(204);
  // });
});
