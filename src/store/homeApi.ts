import { baseApi } from "./baseApi";
import type { Coupon } from "./couponApi";

export interface Feature {
    id: number;
    plan_id: number;
    feature_name: string;
    feature_value: string | null;
    created_at: string;
    updated_at: string;
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
    coupon_code: string | undefined;
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
    coupon_code: string | undefined;
    start_date: string;
    end_date: string | null;
    status: SubscriptionStatus;
}




export const homeApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["SubscriptionPlan", "Subscription"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL SUBSCRIPTION PLANS
            // ================================
            getSubscriptionPlan: builder.query<
                SubscriptionPlan[],
                void
            >({
                query: () => "/home/plans",

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


            // // ================================
            // // GET SUBSCRIPTION PLAN BY ID
            // // ================================
            // getSubscriptionPlanById: builder.query<
            //     SubscriptionPlan,
            //     number
            // >({
            //     query: (id) => `/subscription-plans/${id}`,

            //     transformResponse: (response: any) =>
            //         response.data || response,

            //     providesTags: (_result, _error, id) => [
            //         { type: "SubscriptionPlan", id },
            //     ],
            // }),



        }),
    });

export const {
    useGetSubscriptionPlanQuery,
    useCreateSubscriptionMutation,
} = homeApi;