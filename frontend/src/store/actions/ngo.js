import baseAPI from '../../utils/config/api.js';
import { crud, listTag, itemTag } from '../helpers/crud.js';

const ngoPath = (segment) => `/ngo/${segment}`;

export const unwrapNgoData = (response) => {
  if (response && typeof response === 'object' && 'success' in response) {
    if (response.success === false) {
      throw new Error(response.error || 'Request failed');
    }
    return response.data;
  }
  return response;
};

const unwrapNgoMutation = (response) => {
  if (response && typeof response === 'object' && 'success' in response) {
    if (response.success === false) {
      throw new Error(response.error || 'Request failed');
    }
    const emailSent = response.emailSent ?? response.data?.emailSent ?? response.data?.invitationEmailSent;
    const emailError = response.emailError ?? response.data?.emailError ?? null;
    return {
      ...response.data,
      emailSent,
      emailError,
    };
  }
  return response;
};

export const getNgoErrorMessage = (error, fallback) =>
  error?.data?.error || error?.data?.message || error?.message || fallback;

const ngoCrud = (builder, config) =>
  crud(builder, { ...config, transformResponse: unwrapNgoData });

const ngoApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getNgoDashboard: builder.query({
      query: () => '/ngo/dashboard',
      transformResponse: unwrapNgoData,
      providesTags: ['NgoDashboard'],
    }),

    ...ngoCrud(builder, {
      plural: 'NgoOrganizations',
      singular: 'NgoOrganization',
      path: ngoPath('organizations'),
      tag: 'NgoOrganization',
    }),

    getNgoOrganizationStats: builder.query({
      query: (id) => ngoPath(`organizations/${id}/stats`),
      transformResponse: unwrapNgoData,
    }),

    ...ngoCrud(builder, {
      plural: 'NgoBranches',
      singular: 'NgoBranch',
      path: ngoPath('branches'),
      tag: 'NgoBranch',
    }),

    getNgoBranchesByOrganization: builder.query({
      query: (organizationId) => ngoPath(`branches/organization/${organizationId}`),
      transformResponse: unwrapNgoData,
    }),

    ...ngoCrud(builder, {
      plural: 'NgoDepartments',
      singular: 'NgoDepartment',
      path: ngoPath('departments'),
      tag: 'NgoDepartment',
    }),

    getNgoDepartmentsByBranch: builder.query({
      query: (branchId) => ngoPath(`departments/branch/${branchId}`),
      transformResponse: unwrapNgoData,
    }),

    getNgoDepartmentHierarchy: builder.query({
      query: (organizationId) => ngoPath(`departments/hierarchy/${organizationId}`),
      transformResponse: unwrapNgoData,
    }),

    ...ngoCrud(builder, {
      plural: 'NgoProjects',
      singular: 'NgoProject',
      path: '/ngo/projects',
      tag: 'NgoProject',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoRoles',
      singular: 'NgoRole',
      path: ngoPath('roles'),
      tag: 'NgoRole',
    }),

    getNgoRolesByDepartment: builder.query({
      query: (departmentId) => ngoPath(`roles/department/${departmentId}`),
      transformResponse: unwrapNgoData,
    }),

    getNgoRoleHierarchy: builder.query({
      query: (organizationId) => ngoPath(`roles/hierarchy/${organizationId}`),
      transformResponse: unwrapNgoData,
    }),

    assignNgoRolePermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: ngoPath(`roles/${id}/permissions`),
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: [listTag('NgoRole')],
      transformResponse: unwrapNgoData,
    }),

    getNgoUsers: builder.query({
      query: (params) =>
        params && typeof params === 'object' && Object.keys(params).length
          ? { url: ngoPath('users'), params }
          : ngoPath('users'),
      providesTags: [listTag('NgoUser')],
      transformResponse: unwrapNgoData,
    }),
    getNgoUserById: builder.query({
      query: (id) => ngoPath(`users/${id}`),
      providesTags: (_r, _e, id) => [itemTag('NgoUser', id)],
      transformResponse: unwrapNgoData,
    }),
    createNgoUser: builder.mutation({
      query: (body) => ({ url: ngoPath('users'), method: 'POST', body }),
      invalidatesTags: [listTag('NgoUser')],
      transformResponse: unwrapNgoMutation,
    }),
    updateNgoUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: ngoPath(`users/${id}`),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [listTag('NgoUser'), itemTag('NgoUser', id)],
      transformResponse: unwrapNgoData,
    }),
    deleteNgoUser: builder.mutation({
      query: (id) => ({ url: ngoPath(`users/${id}`), method: 'DELETE' }),
      invalidatesTags: [listTag('NgoUser')],
      transformResponse: unwrapNgoData,
    }),

    activateNgoUser: builder.mutation({
      query: ({ id, approvedBy = '' }) => ({
        url: ngoPath(`users/${id}/activate`),
        method: 'PUT',
        body: { approvedBy },
      }),
      invalidatesTags: [listTag('NgoUser')],
      transformResponse: unwrapNgoMutation,
    }),

    suspendNgoUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: ngoPath(`users/${id}/suspend`),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [listTag('NgoUser')],
      transformResponse: unwrapNgoData,
    }),

    getNgoAccountProfile: builder.query({
      query: () => ngoPath('account/me'),
      providesTags: ['NgoAccount'],
      transformResponse: unwrapNgoData,
    }),

    updateNgoAccountProfile: builder.mutation({
      query: (body) => ({
        url: ngoPath('account/me'),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['NgoAccount'],
      transformResponse: unwrapNgoData,
    }),

    changeNgoAccountPassword: builder.mutation({
      query: (body) => ({
        url: ngoPath('account/password'),
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapNgoData,
    }),

    ...ngoCrud(builder, {
      plural: 'NgoFinances',
      singular: 'NgoFinance',
      path: ngoPath('finances'),
      tag: 'NgoFinance',
    }),

    getNgoFinancialSummary: builder.query({
      query: (organizationId) => ngoPath(`finances/summary/${organizationId}`),
    }),

    getNgoFinancesByProject: builder.query({
      query: (projectId) => ngoPath(`finances/project/${projectId}`),
    }),

    ...ngoCrud(builder, {
      plural: 'NgoContracts',
      singular: 'NgoContract',
      path: '/ngo/contracts',
      tag: 'NgoContract',
    }),
    patchNgoContract: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/ngo/contracts/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => ['NgoContract', { type: 'NgoContract', id }],
      transformResponse: unwrapNgoData,
    }),

    getNgoMonitoringSummary: builder.query({
      query: (params) =>
        params && typeof params === 'object' && Object.keys(params).length
          ? { url: '/ngo/contracts/analytics/summary', params }
          : '/ngo/contracts/analytics/summary',
      providesTags: ['NgoContract'],
      transformResponse: unwrapNgoData,
    }),

    ...ngoCrud(builder, {
      plural: 'NgoTenders',
      singular: 'NgoTender',
      path: '/ngo/tenders',
      tag: 'NgoTender',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoStorages',
      singular: 'NgoStorage',
      path: '/ngo/storages',
      tag: 'NgoStorage',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoFieldSites',
      singular: 'NgoFieldSite',
      path: '/ngo/field-sites',
      tag: 'NgoFieldSite',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoFieldVisits',
      singular: 'NgoFieldVisit',
      path: '/ngo/field-visits',
      tag: 'NgoFieldVisit',
    }),

    getNgoGpsLocations: builder.query({
      query: () => '/ngo/gps-locations',
      transformResponse: unwrapNgoData,
      providesTags: ['NgoFieldSite'],
    }),

    ...ngoCrud(builder, {
      plural: 'NgoServiceControls',
      singular: 'NgoServiceControl',
      path: '/ngo/service-control',
      tag: 'NgoServiceControl',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoImpacts',
      singular: 'NgoImpact',
      path: '/ngo/impacts',
      tag: 'NgoImpact',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoEvaluations',
      singular: 'NgoEvaluation',
      path: '/ngo/evaluations',
      tag: 'NgoEvaluation',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoAudits',
      singular: 'NgoAudit',
      path: ngoPath('audits'),
      tag: 'NgoAudit',
    }),

    ...ngoCrud(builder, {
      plural: 'NgoOrgCharts',
      singular: 'NgoOrgChart',
      path: ngoPath('org-charts'),
      tag: 'NgoOrgChart',
    }),

    getNgoActiveOrgChart: builder.query({
      query: (organizationId) => ngoPath(`org-charts/active/${organizationId}`),
    }),

    generateNgoOrgChart: builder.query({
      query: (organizationId) => ngoPath(`org-charts/generate/${organizationId}`),
    }),

    ...ngoCrud(builder, {
      plural: 'NgoBeneficialOwners',
      singular: 'NgoBeneficialOwner',
      path: ngoPath('beneficial-owners'),
      tag: 'NgoBeneficialOwner',
    }),

    getNgoOwnershipStructure: builder.query({
      query: (organizationId) =>
        ngoPath(`beneficial-owners/structure/${organizationId}`),
    }),

    getNgoPoliticallyExposed: builder.query({
      query: (organizationId) => ngoPath(`beneficial-owners/pep/${organizationId}`),
    }),

    verifyNgoBeneficialOwner: builder.mutation({
      query: (id) => ({
        url: ngoPath(`beneficial-owners/${id}/verify`),
        method: 'PUT',
      }),
      invalidatesTags: [listTag('NgoBeneficialOwner')],
    }),

    getNgoOrganizationOverview: builder.query({
      query: (organizationId) =>
        ngoPath(`integration/organization/${organizationId}/overview`),
    }),

    getNgoProjectDetails: builder.query({
      query: (projectId) => ngoPath(`integration/project/${projectId}/details`),
    }),

    linkNgoTenderToProject: builder.mutation({
      query: (body) => ({
        url: ngoPath('integration/link/tender-to-project'),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NgoProject', 'NgoTender'],
    }),

    linkNgoContractToTenderProject: builder.mutation({
      query: (body) => ({
        url: ngoPath('integration/link/contract-to-tender-project'),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NgoContract', 'NgoProject', 'NgoTender'],
    }),

    ...ngoCrud(builder, {
      plural: 'NgoChurchRecords',
      singular: 'NgoChurchRecord',
      path: '/ngo/church',
      tag: 'NgoChurch',
    }),

    getNgoChurchSummary: builder.query({
      query: () => '/ngo/church/summary',
      transformResponse: unwrapNgoData,
      providesTags: ['NgoChurch'],
    }),

    getNgoChurchWorkspace: builder.query({
      query: () => '/ngo/church/workspace',
      transformResponse: unwrapNgoData,
      providesTags: ['NgoChurch'],
    }),

    generateNgoChurchMemberId: builder.query({
      query: () => '/ngo/church/members/next-id',
      transformResponse: unwrapNgoData,
    }),

    getNgoChurchUsers: builder.query({
      query: () => '/ngo/church/users',
      transformResponse: unwrapNgoData,
      providesTags: ['NgoChurchUser'],
    }),

    getNgoChurchUserById: builder.query({
      query: (id) => `/ngo/church/users/${id}`,
      transformResponse: unwrapNgoData,
      providesTags: (_r, _e, id) => [{ type: 'NgoChurchUser', id }],
    }),

    createNgoChurchUser: builder.mutation({
      query: (body) => ({ url: '/ngo/church/users', method: 'POST', body }),
      invalidatesTags: ['NgoChurchUser'],
      transformResponse: unwrapNgoMutation,
    }),

    updateNgoChurchUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/ngo/church/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['NgoChurchUser'],
      transformResponse: unwrapNgoData,
    }),

    deleteNgoChurchUser: builder.mutation({
      query: (id) => ({ url: `/ngo/church/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['NgoChurchUser'],
      transformResponse: unwrapNgoData,
    }),

    resendNgoChurchUserCredentials: builder.mutation({
      query: (id) => ({
        url: `/ngo/church/users/${id}/resend-credentials`,
        method: 'POST',
      }),
      transformResponse: unwrapNgoMutation,
    }),

    uploadNgoChurchMemberPhoto: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        return {
          url: '/ngo/church/upload-photo',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: unwrapNgoData,
    }),
  }),
});

export const {
  useGetNgoDashboardQuery,
  useGetNgoOrganizationsQuery,
  useGetNgoOrganizationByIdQuery,
  useCreateNgoOrganizationMutation,
  useUpdateNgoOrganizationMutation,
  useDeleteNgoOrganizationMutation,
  useGetNgoOrganizationStatsQuery,
  useGetNgoBranchesQuery,
  useGetNgoBranchByIdQuery,
  useCreateNgoBranchMutation,
  useUpdateNgoBranchMutation,
  useDeleteNgoBranchMutation,
  useGetNgoBranchesByOrganizationQuery,
  useGetNgoDepartmentsQuery,
  useGetNgoDepartmentByIdQuery,
  useCreateNgoDepartmentMutation,
  useUpdateNgoDepartmentMutation,
  useDeleteNgoDepartmentMutation,
  useGetNgoDepartmentsByBranchQuery,
  useGetNgoDepartmentHierarchyQuery,
  useGetNgoProjectsQuery,
  useGetNgoProjectByIdQuery,
  useCreateNgoProjectMutation,
  useUpdateNgoProjectMutation,
  useDeleteNgoProjectMutation,
  useGetNgoRolesQuery,
  useGetNgoRoleByIdQuery,
  useCreateNgoRoleMutation,
  useUpdateNgoRoleMutation,
  useDeleteNgoRoleMutation,
  useGetNgoRolesByDepartmentQuery,
  useGetNgoRoleHierarchyQuery,
  useAssignNgoRolePermissionsMutation,
  useGetNgoUsersQuery,
  useGetNgoUserByIdQuery,
  useCreateNgoUserMutation,
  useUpdateNgoUserMutation,
  useDeleteNgoUserMutation,
  useActivateNgoUserMutation,
  useSuspendNgoUserMutation,
  useGetNgoAccountProfileQuery,
  useUpdateNgoAccountProfileMutation,
  useChangeNgoAccountPasswordMutation,
  useGetNgoFinancesQuery,
  useGetNgoFinanceByIdQuery,
  useCreateNgoFinanceMutation,
  useUpdateNgoFinanceMutation,
  useDeleteNgoFinanceMutation,
  useGetNgoFinancialSummaryQuery,
  useGetNgoFinancesByProjectQuery,
  useGetNgoContractsQuery,
  useGetNgoContractByIdQuery,
  useCreateNgoContractMutation,
  usePatchNgoContractMutation,
  useUpdateNgoContractMutation,
  useDeleteNgoContractMutation,
  useGetNgoMonitoringSummaryQuery,
  useGetNgoTendersQuery,
  useGetNgoTenderByIdQuery,
  useCreateNgoTenderMutation,
  useUpdateNgoTenderMutation,
  useDeleteNgoTenderMutation,
  useGetNgoStoragesQuery,
  useGetNgoStorageByIdQuery,
  useCreateNgoStorageMutation,
  useUpdateNgoStorageMutation,
  useDeleteNgoStorageMutation,
  useGetNgoFieldSitesQuery,
  useGetNgoFieldSiteByIdQuery,
  useCreateNgoFieldSiteMutation,
  useUpdateNgoFieldSiteMutation,
  useDeleteNgoFieldSiteMutation,
  useGetNgoFieldVisitsQuery,
  useGetNgoFieldVisitByIdQuery,
  useCreateNgoFieldVisitMutation,
  useUpdateNgoFieldVisitMutation,
  useDeleteNgoFieldVisitMutation,
  useGetNgoGpsLocationsQuery,
  useGetNgoServiceControlsQuery,
  useGetNgoServiceControlByIdQuery,
  useCreateNgoServiceControlMutation,
  useUpdateNgoServiceControlMutation,
  useDeleteNgoServiceControlMutation,
  useGetNgoImpactsQuery,
  useGetNgoImpactByIdQuery,
  useCreateNgoImpactMutation,
  useUpdateNgoImpactMutation,
  useDeleteNgoImpactMutation,
  useGetNgoEvaluationsQuery,
  useGetNgoEvaluationByIdQuery,
  useCreateNgoEvaluationMutation,
  useUpdateNgoEvaluationMutation,
  useDeleteNgoEvaluationMutation,
  useGetNgoAuditsQuery,
  useGetNgoAuditByIdQuery,
  useCreateNgoAuditMutation,
  useUpdateNgoAuditMutation,
  useDeleteNgoAuditMutation,
  useGetNgoOrgChartsQuery,
  useGetNgoOrgChartByIdQuery,
  useCreateNgoOrgChartMutation,
  useUpdateNgoOrgChartMutation,
  useDeleteNgoOrgChartMutation,
  useGetNgoActiveOrgChartQuery,
  useGenerateNgoOrgChartQuery,
  useGetNgoBeneficialOwnersQuery,
  useGetNgoBeneficialOwnerByIdQuery,
  useCreateNgoBeneficialOwnerMutation,
  useUpdateNgoBeneficialOwnerMutation,
  useDeleteNgoBeneficialOwnerMutation,
  useGetNgoOwnershipStructureQuery,
  useGetNgoPoliticallyExposedQuery,
  useVerifyNgoBeneficialOwnerMutation,
  useGetNgoOrganizationOverviewQuery,
  useGetNgoProjectDetailsQuery,
  useLinkNgoTenderToProjectMutation,
  useLinkNgoContractToTenderProjectMutation,
  useGetNgoChurchRecordsQuery,
  useGetNgoChurchRecordByIdQuery,
  useCreateNgoChurchRecordMutation,
  useUpdateNgoChurchRecordMutation,
  useDeleteNgoChurchRecordMutation,
  useGetNgoChurchSummaryQuery,
  useGetNgoChurchWorkspaceQuery,
  useLazyGenerateNgoChurchMemberIdQuery,
  useGetNgoChurchUsersQuery,
  useGetNgoChurchUserByIdQuery,
  useCreateNgoChurchUserMutation,
  useUpdateNgoChurchUserMutation,
  useDeleteNgoChurchUserMutation,
  useResendNgoChurchUserCredentialsMutation,
  useUploadNgoChurchMemberPhotoMutation,
} = ngoApi;

export default ngoApi;
