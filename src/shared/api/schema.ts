export type paths = {
  "/api/v1/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["Login"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["RefreshTokens"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/auth/logout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["Logout"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ListUsers"];
    put?: never;
    post: operations["CreateUser"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetCurrentUser"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/me/password": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ChangePassword"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/{userId}/deactivate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["DeactivateUser"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/{userId}/activate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ActivateUser"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/{userId}/password": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ResetPassword"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/users/{userId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations["UpdateUser"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/clients": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ListClients"];
    put?: never;
    post: operations["CreateClient"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/clients/{clientId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetClient"];
    put: operations["UpdateClient"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/clients/{clientId}/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ArchiveClient"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/devices": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ListDevices"];
    put?: never;
    post: operations["CreateDevice"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/devices/{deviceId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetDevice"];
    put: operations["UpdateDevice"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/devices/{deviceId}/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ArchiveDevice"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ListWorkOrders"];
    put?: never;
    post: operations["CreateWorkOrder"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetWorkOrder"];
    put: operations["UpdateWorkOrder"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/assign": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["AssignTechnician"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/reassign": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ReassignTechnician"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/unassign": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["UnassignTechnician"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/start": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["StartWork"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/complete": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["CompleteWorkOrder"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/invoice": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["InvoiceWorkOrder"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/protocol": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetServiceProtocol"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/parts": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ListParts"];
    put?: never;
    post: operations["CreatePart"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/parts/{partId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetPart"];
    put: operations["UpdatePart"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/parts/{partId}/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ArchivePart"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/parts/{partId}/restock": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["RestockPart"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/work-orders/{workOrderId}/service-entries": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["ListServiceEntries"];
    put?: never;
    post: operations["AddServiceEntry"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/dashboard/summary": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["GetDashboardSummary"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/v1/demo-data/reset": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["ResetDemoData"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
};
export type webhooks = Record<string, never>;
export type components = {
  schemas: {
    AddServiceEntryRequest: {
      note: string;
      isCorrection: boolean;
      photoUrls?: null | string[];
      workStartedAt?: null | string;
      workFinishedAt?: null | string;
      latitude?: null | number;
      longitude?: null | number;
      parts?: null | components["schemas"]["ServiceEntryPartRequest"][];
    };
    AssignTechnicianRequest: {
      technicianId: string;
      dueDate?: null | string;
    };
    AuthTokensResponse: {
      accessToken: string;
      accessTokenExpiresAt: string;
      refreshToken: string;
      refreshTokenExpiresAt: string;
    };
    ChangePasswordRequest: {
      currentPassword: string;
      newPassword: string;
    };
    ClientAddress: {
      street: string;
      buildingNumber: string;
      postalCode: string;
      city: string;
    };
    ClientResponse: {
      id: string;
      name: string;
      address: components["schemas"]["ClientAddress"];
      contactPerson: string;
      phone: string;
      email: null | string;
      createdAt: string;
      archivedAt: null | string;
    };
    CreateClientRequest: {
      name: string;
      address: components["schemas"]["ClientAddress"];
      contactPerson: string;
      phone: string;
      email?: null | string;
    };
    CreateDeviceRequest: {
      clientId: string;
      serialNumber: string;
      model: string;
      manufacturer: string;
      installationDate: string;
    };
    CreatePartRequest: {
      name: string;
      catalogNumber: string;
      stockQuantity: number;
      unitPrice: number;
    };
    CreateUserRequest: {
      email: string;
      fullName: string;
      password: string;
      role: string;
    };
    CreateWorkOrderRequest: {
      deviceId: string;
      description: string;
      dueDate: string;
      priority?: components["schemas"]["WorkOrderPriority"];
    };
    DashboardSummaryResponse: {
      generatedAt: string;
      weekStart: string;
      weekEnd: string;
      statusCounts: components["schemas"]["WorkOrderStatusCountResponse"][];
      overdueCount: number;
      technicians: components["schemas"]["TechnicianWorkloadResponse"][];
    };
    DeviceListItemResponse: {
      id: string;
      clientId: string;
      clientName: string;
      serialNumber: string;
      model: string;
      manufacturer: string;
      installationDate: string;
      createdAt: string;
      archivedAt: null | string;
    };
    DeviceResponse: {
      id: string;
      clientId: string;
      serialNumber: string;
      model: string;
      manufacturer: string;
      installationDate: string;
      createdAt: string;
      archivedAt: null | string;
    };
    HttpValidationProblemDetails: {
      type?: null | string;
      title?: null | string;
      status?: null | number;
      detail?: null | string;
      instance?: null | string;
      errors?: {
        [key: string]: string[];
      };
    };
    LoginRequest: {
      email: string;
      password: string;
    };
    LogoutRequest: {
      refreshToken: string;
    };
    PagedResponseOfClientResponse: {
      items: components["schemas"]["ClientResponse"][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PagedResponseOfDeviceListItemResponse: {
      items: components["schemas"]["DeviceListItemResponse"][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PagedResponseOfPartResponse: {
      items: components["schemas"]["PartResponse"][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PagedResponseOfUserResponse: {
      items: components["schemas"]["UserResponse"][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PagedResponseOfWorkOrderListItemResponse: {
      items: components["schemas"]["WorkOrderListItemResponse"][];
      page: number;
      pageSize: number;
      totalCount: number;
    };
    PartResponse: {
      id: string;
      name: string;
      catalogNumber: string;
      stockQuantity: number;
      unitPrice: number;
      createdAt: string;
      archivedAt: null | string;
    };
    ProblemDetails: {
      type?: null | string;
      title?: null | string;
      status?: null | number;
      detail?: null | string;
      instance?: null | string;
      errorCode?: null | string;
    };
    ReassignTechnicianRequest: {
      technicianId: string;
      dueDate?: null | string;
    };
    RefreshRequest: {
      refreshToken: string;
    };
    ResetPasswordRequest: {
      newPassword: string;
    };
    RestockPartRequest: {
      quantity: number;
    };
    ServiceEntryPartRequest: {
      partId: string;
      quantity: number;
    };
    ServiceEntryPartResponse: {
      partId: string;
      partName: string;
      catalogNumber: string;
      quantity: number;
      unitPrice: number;
    };
    ServiceEntryResponse: {
      id: string;
      workOrderId: string;
      technicianId: string;
      technicianName: string;
      note: string;
      isCorrection: boolean;
      photoUrls: string[];
      workStartedAt: null | string;
      workFinishedAt: null | string;
      latitude: null | number;
      longitude: null | number;
      parts: components["schemas"]["ServiceEntryPartResponse"][];
      createdAt: string;
    };
    Stream: string;
    TechnicianWorkloadResponse: {
      technicianId: string;
      email: string;
      fullName: string;
      assignedCount: number;
      inProgressCount: number;
      overdueCount: number;
      dueThisWeekCount: number;
    };
    UpdateClientRequest: {
      name: string;
      address: components["schemas"]["ClientAddress"];
      contactPerson: string;
      phone: string;
      email?: null | string;
    };
    UpdateDeviceRequest: {
      serialNumber: string;
      model: string;
      manufacturer: string;
      installationDate: string;
    };
    UpdatePartRequest: {
      name: string;
      catalogNumber: string;
      unitPrice: number;
    };
    UpdateUserRequest: {
      fullName: string;
    };
    UpdateWorkOrderRequest: {
      description: string;
      priority: components["schemas"]["WorkOrderPriority"];
      dueDate: string;
    };
    UserResponse: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      isActive: boolean;
    };
    WorkOrderListItemResponse: {
      id: string;
      number: string;
      deviceId: string;
      deviceSerialNumber: string;
      deviceModel: string;
      clientId: string;
      clientName: string;
      description: string;
      priority: components["schemas"]["WorkOrderPriority"];
      status: components["schemas"]["WorkOrderStatus"];
      technicianId: null | string;
      technicianEmail: null | string;
      technicianName: null | string;
      dueDate: string;
      isOverdue: boolean;
      createdAt: string;
      startedAt: null | string;
      completedAt: null | string;
      invoicedAt: null | string;
    };
    WorkOrderPriority: "Low" | "Normal" | "High" | "Critical";
    WorkOrderResponse: {
      id: string;
      number: string;
      deviceId: string;
      deviceSerialNumber: string;
      deviceModel: string;
      clientId: string;
      clientName: string;
      description: string;
      priority: components["schemas"]["WorkOrderPriority"];
      status: components["schemas"]["WorkOrderStatus"];
      technicianId: null | string;
      technicianEmail: null | string;
      technicianName: null | string;
      dueDate: string;
      isOverdue: boolean;
      createdAt: string;
      startedAt: null | string;
      completedAt: null | string;
      invoicedAt: null | string;
    };
    WorkOrderStatus: "New" | "Assigned" | "InProgress" | "Completed" | "Invoiced";
    WorkOrderStatusCountResponse: {
      status: components["schemas"]["WorkOrderStatus"];
      count: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
  Login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["LoginRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthTokensResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  RefreshTokens: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RefreshRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthTokensResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  Logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["LogoutRequest"];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ListUsers: {
    parameters: {
      query?: {
        page?: number;
        pageSize?: number;
        role?: string;
        isActive?: boolean;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PagedResponseOfUserResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreateUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateUserRequest"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UserResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetCurrentUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UserResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ChangePassword: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ChangePasswordRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthTokensResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  DeactivateUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ActivateUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ResetPassword: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ResetPasswordRequest"];
      };
    };
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  UpdateUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateUserRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["UserResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ListClients: {
    parameters: {
      query?: {
        page?: number;
        pageSize?: number;
        search?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PagedResponseOfClientResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreateClient: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateClientRequest"];
      };
    };
    responses: {
      201: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ClientResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetClient: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        clientId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ClientResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  UpdateClient: {
    parameters: {
      query?: never;
      header: {
        "If-Match": string;
      };
      path: {
        clientId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateClientRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ClientResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ArchiveClient: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        clientId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ListDevices: {
    parameters: {
      query?: {
        page?: number;
        pageSize?: number;
        clientId?: string;
        search?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PagedResponseOfDeviceListItemResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreateDevice: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateDeviceRequest"];
      };
    };
    responses: {
      201: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DeviceResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetDevice: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        deviceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DeviceResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  UpdateDevice: {
    parameters: {
      query?: never;
      header: {
        "If-Match": string;
      };
      path: {
        deviceId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateDeviceRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DeviceResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ArchiveDevice: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        deviceId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ListWorkOrders: {
    parameters: {
      query?: {
        page?: number;
        pageSize?: number;
        status?: components["schemas"]["WorkOrderStatus"];
        technicianId?: string;
        deviceId?: string;
        clientId?: string;
        isOverdue?: boolean;
        dueFrom?: string;
        dueTo?: string;
        search?: string;
        sortBy?: "DueDate" | "CreatedAt" | "Priority" | "Status" | "ClientName";
        sortDirection?: "Asc" | "Desc";
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PagedResponseOfWorkOrderListItemResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreateWorkOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateWorkOrderRequest"];
      };
    };
    responses: {
      201: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetWorkOrder: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  UpdateWorkOrder: {
    parameters: {
      query?: never;
      header: {
        "If-Match": string;
      };
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateWorkOrderRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  AssignTechnician: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AssignTechnicianRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ReassignTechnician: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ReassignTechnicianRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  UnassignTechnician: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  StartWork: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CompleteWorkOrder: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  InvoiceWorkOrder: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WorkOrderResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetServiceProtocol: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/pdf": components["schemas"]["Stream"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ListParts: {
    parameters: {
      query?: {
        page?: number;
        pageSize?: number;
        search?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PagedResponseOfPartResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  CreatePart: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreatePartRequest"];
      };
    };
    responses: {
      201: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PartResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetPart: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        partId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PartResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  UpdatePart: {
    parameters: {
      query?: never;
      header: {
        "If-Match": string;
      };
      path: {
        partId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdatePartRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PartResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ArchivePart: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        partId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  RestockPart: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        partId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RestockPartRequest"];
      };
    };
    responses: {
      200: {
        headers: {
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PartResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ListServiceEntries: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ServiceEntryResponse"][];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  AddServiceEntry: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        workOrderId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AddServiceEntryRequest"];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ServiceEntryResponse"];
        };
      };
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["HttpValidationProblemDetails"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  GetDashboardSummary: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["DashboardSummaryResponse"];
        };
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
  ResetDemoData: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/problem+json": components["schemas"]["ProblemDetails"];
        };
      };
    };
  };
}
