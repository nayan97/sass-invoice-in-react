import { baseApi } from "./baseApi";
import type { SubscriptionPlan } from "./subscriptionPlansApi";

export interface Coupon {
    id: number;
    code: string;
    discount: string;
    type: "percent" | "fixed";
    max_uses: number;
    used_count: number;
    min_plan_id: number;
    expires_at: string;
    is_active: number | boolean;
    created_at: string;
    updated_at: string;
    min_plan: SubscriptionPlan;
}

export interface CouponPayload {
    code: string;
    discount: string;
    type: "percent" | "fixed";
    max_uses: number;
    min_plan_id: number;
    expires_at: string;
    is_active: boolean;
}

export const couponApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["Coupon"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL COUPONS
            // ================================
            getCoupons: builder.query<Coupon[], void>({
                query: () => "/subscription-coupons",

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({
                                type: "Coupon" as const,
                                id,
                            })),
                            { type: "Coupon", id: "LIST" },
                        ]
                        : [{ type: "Coupon", id: "LIST" }],
            }),

            // ================================
            // GET COUPON BY ID
            // ================================
            getCouponById: builder.query<Coupon, number>({
                query: (id) => `/subscription-coupons/${id}`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (_result, _error, id) => [
                    { type: "Coupon", id },
                ],
            }),

            // ================================
            // CREATE COUPON
            // ================================
            createCoupon: builder.mutation<Coupon, CouponPayload>({
                query: (body) => ({
                    url: "/subscription-coupons",
                    method: "POST",
                    body,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: [{ type: "Coupon", id: "LIST" }],
            }),

            // ================================
            // UPDATE COUPON
            // ================================
            updateCoupon: builder.mutation<
                Coupon,
                { id: number; data: Partial<CouponPayload> }
            >({
                query: ({ id, data }) => ({
                    url: `/subscription-coupons/${id}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { id }) => [
                    { type: "Coupon", id },
                    { type: "Coupon", id: "LIST" },
                ],
            }),

            // ================================
            // DELETE COUPON
            // ================================
            deleteCoupon: builder.mutation<
                { success: boolean; id: number },
                number
            >({
                query: (id) => ({
                    url: `/subscription-coupons/${id}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, id) => [
                    { type: "Coupon", id },
                    { type: "Coupon", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetCouponsQuery,
    useGetCouponByIdQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
} = couponApi;