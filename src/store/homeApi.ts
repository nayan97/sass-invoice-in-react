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



export const homeApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["SubscriptionPlan"],
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
} = homeApi;