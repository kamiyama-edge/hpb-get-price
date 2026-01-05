/**
 * Supabaseユーティリティのテスト
 */

import { describe, it, expect } from 'vitest'
import { isAllowedEmail, ALLOWED_DOMAIN } from '@/lib/supabase'


describe('isAllowedEmail', () => {
    it('許可されたドメインのメールアドレスはtrueを返す', () => {
        expect(isAllowedEmail('user@edge-i.jp')).toBe(true)
    })

    it('許可されていないドメインのメールアドレスはfalseを返す', () => {
        expect(isAllowedEmail('user@gmail.com')).toBe(false)
    })

    it('サブドメインはfalseを返す', () => {
        expect(isAllowedEmail('user@sub.edge-i.jp')).toBe(false)
    })

    it('undefinedはfalseを返す', () => {
        expect(isAllowedEmail(undefined)).toBe(false)
    })

    it('空文字列はfalseを返す', () => {
        expect(isAllowedEmail('')).toBe(false)
    })
})


describe('ALLOWED_DOMAIN', () => {
    it('許可されたドメインが設定されている', () => {
        expect(ALLOWED_DOMAIN).toBe('@edge-i.jp')
    })
})
