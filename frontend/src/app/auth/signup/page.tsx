'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Anchor,
  Stack,
} from '@mantine/core'
import Link from 'next/link'
import { useSignUp, useNavigationLoading } from '@/lib/hooks'

// ========================================
// バリデーションスキーマ
// ========================================
const signUpSchema = z
  .object({
    email: z.email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .regex(/[A-Z]/, 'パスワードには大文字を含めてください')
      .regex(/[a-z]/, 'パスワードには小文字を含めてください')
      .regex(/[0-9]/, 'パスワードには数字を含めてください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type SignUpFormValues = z.infer<typeof signUpSchema>

// ========================================
// サインアップページコンポーネント
// ========================================
export default function SignUpPage() {
  const signUpMutation = useSignUp()
  const { isNavigating, withNavigation } = useNavigationLoading()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await withNavigation(() =>
        signUpMutation.mutateAsync({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
        }),
      )
      // 成功時は自動的にサインインページにリダイレクトされる
    } catch (error: unknown) {
      // エラーは useMutation 内で自動的に管理される
      console.error('サインアップエラー:', error)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mb={30}>
        すでにアカウントをお持ちですか？{' '}
        <Anchor component={Link} href="/auth/signin" size="sm">
          ログイン
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="メールアドレス"
              placeholder="your@email.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <TextInput
              label="表示名（任意）"
              placeholder="ユーザー名を入力"
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <PasswordInput
              label="パスワード"
              placeholder="8文字以上（大文字・小文字・数字を含む）"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <PasswordInput
              label="パスワード（確認）"
              placeholder="もう一度入力してください"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {signUpMutation.isError && (
              <Text c="red" size="sm">
                {signUpMutation.error instanceof Error
                  ? signUpMutation.error.message
                  : '登録に失敗しました。もう一度お試しください。'}
              </Text>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting || signUpMutation.isPending || isNavigating}
            >
              新規登録
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
