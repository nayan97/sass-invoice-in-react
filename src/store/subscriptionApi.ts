import { baseApi } from "./baseApi";
import type { SubscriptionPlan } from "./subscriptionPlansApi";
import type { Coupon } from "./couponApi";

export type SubscriptionStatus =
    | "trial"
    | "active"
    | "cancelled"
    | "expired"
    | "pending";

export interface Subscription {
    id: number;
    company_id: number;
    plan_id: number;
    coupon_id: number | null;
    start_date: string;
    end_date: string | null;
    trial_ends_at: string | null;
    renews_at: string | null;
    cancelled_at: string | null;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
    plan: SubscriptionPlan;
    coupon: Coupon | null;
}

export interface SubscriptionPayload {
    company_id: number;
    plan_id: number;
    coupon_id: number | null;
    start_date: string;
    end_date: string | null;
    status: SubscriptionStatus;
}

export const subscriptionApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["Subscription"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL SUBSCRIPTIONS
            // ================================
            getSubscriptions: builder.query<Subscription[], void>({
                query: () => "/subscriptions",

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({
                                type: "Subscription" as const,
                                id,
                            })),
                            { type: "Subscription", id: "LIST" },
                        ]
                        : [{ type: "Subscription", id: "LIST" }],
            }),

            // ================================
            // GET SUBSCRIPTION BY ID
            // ================================
            getSubscriptionById: builder.query<Subscription, number>({
                query: (id) => `/subscriptions/${id}`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (_result, _error, id) => [
                    { type: "Subscription", id },
                ],
            }),

            // ================================
            // CREATE SUBSCRIPTION
            // ================================
            createSubscription: builder.mutation<
                Subscription,
                SubscriptionPayload
            >({
                query: (body) => ({
                    url: "/subscriptions",
                    method: "POST",
                    body,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: [{ type: "Subscription", id: "LIST" }],
            }),

            // ================================
            // UPDATE SUBSCRIPTION
            // ================================
            updateSubscription: builder.mutation<
                Subscription,
                { id: number; data: Partial<SubscriptionPayload> }
            >({
                query: ({ id, data }) => ({
                    url: `/subscriptions/${id}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { id }) => [
                    { type: "Subscription", id },
                    { type: "Subscription", id: "LIST" },
                ],
            }),

            // ================================
            // CANCEL SUBSCRIPTION
            // ================================
            cancelSubscription: builder.mutation<Subscription, number>({
                query: (id) => ({
                    url: `/subscriptions/${id}/cancel`,
                    method: "POST",
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, id) => [
                    { type: "Subscription", id },
                    { type: "Subscription", id: "LIST" },
                ],
            }),

            // ================================
            // DELETE SUBSCRIPTION
            // ================================
            deleteSubscription: builder.mutation<
                { success: boolean; id: number },
                number
            >({
                query: (id) => ({
                    url: `/subscriptions/${id}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, id) => [
                    { type: "Subscription", id },
                    { type: "Subscription", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetSubscriptionsQuery,
    useGetSubscriptionByIdQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
    useCancelSubscriptionMutation,
    useDeleteSubscriptionMutation,
} = subscriptionApi;