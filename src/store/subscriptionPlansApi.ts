import { baseApi } from "./baseApi";

export interface Feature {
    id?: number;
    plan_id?: number;
    feature_name: string;
    feature_value: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    price: string;
    customer_limit: number;
    product_limit: number;
    invoice_limit: number;
    trial_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    features: Feature[];
}

export interface SubscriptionPlanPayload {
    name: string;
    price: string;
    customer_limit: number;
    product_limit: number;
    invoice_limit: number;
    trial_days: number;
    is_active: boolean;
    features: Pick<Feature, "feature_name" | "feature_value">[];
}

export const subscriptionPlansApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["SubscriptionPlan"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL SUBSCRIPTION PLANS
            // ================================
            getSubscriptionPlans: builder.query<
                SubscriptionPlan[],
                void
            >({
                query: () => "/subscription-plans",

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({
                                type: "SubscriptionPlan" as const,
                                id,
                            })),
                            { type: "SubscriptionPlan", id: "LIST" },
                        ]
                        : [{ type: "SubscriptionPlan", id: "LIST" }],
            }),

            // ================================
            // GET SUBSCRIPTION PLAN BY ID
            // ================================
            getSubscriptionPlanById: builder.query<
                SubscriptionPlan,
                number
            >({
                query: (id) => `/subscription-plans/${id}`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (_result, _error, id) => [
                    { type: "SubscriptionPlan", id },
                ],
            }),

            // ================================
            // CREATE SUBSCRIPTION PLAN
            // ================================
            createSubscriptionPlan: builder.mutation<
                SubscriptionPlan,
                SubscriptionPlanPayload
            >({
                query: (body) => ({
                    url: "/subscription-plans",
                    method: "POST",
                    body,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: [
                    { type: "SubscriptionPlan", id: "LIST" },
                ],
            }),

            // ================================
            // UPDATE SUBSCRIPTION PLAN
            // ================================
            updateSubscriptionPlan: builder.mutation<
                SubscriptionPlan,
                { id: number; data: Partial<SubscriptionPlanPayload> }
            >({
                query: ({ id, data }) => ({
                    url: `/subscription-plans/${id}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { id }) => [
                    { type: "SubscriptionPlan", id },
                    { type: "SubscriptionPlan", id: "LIST" },
                ],
            }),

            // ================================
            // DELETE SUBSCRIPTION PLAN
            // ================================
            deleteSubscriptionPlan: builder.mutation<
                { success: boolean; id: number },
                number
            >({
                query: (id) => ({
                    url: `/subscription-plans/${id}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, id) => [
                    { type: "SubscriptionPlan", id },
                    { type: "SubscriptionPlan", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetSubscriptionPlansQuery,
    useGetSubscriptionPlanByIdQuery,
    useCreateSubscriptionPlanMutation,
    useUpdateSubscriptionPlanMutation,
    useDeleteSubscriptionPlanMutation,
} = subscriptionPlansApi;