'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
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
  Alert,
} from '@mantine/core'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSignIn } from '@/lib/hooks'

// ========================================
// バリデーションスキーマ
// ========================================
const signInSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

type SignInFormValues = z.infer<typeof signInSchema>

// ========================================
// サインインページコンポーネント
// ========================================
export default function SignInPage() {
  const searchParams = useSearchParams()
  const signupSuccess = searchParams.get('signup') === 'success'
  const signInMutation = useSignIn()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await signInMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })
      // 成功時は自動的にダッシュボードにリダイレクトされる
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('サインインエラー:', error.message)
      } else {
        console.error('予期しないエラー:', error)
      }
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="md">
        {process.env.NEXT_PUBLIC_APP_NAME || 'FridgeChef'}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mb={30}>
        アカウントをお持ちでないですか？{' '}
        <Anchor component={Link} href="/auth/signup" size="sm">
          新規登録
        </Anchor>
      </Text>

      {/* サインアップ成功メッセージ */}
      {signupSuccess && (
        <Alert
          icon={<CheckCircleIcon style={{ width: 16, height: 16 }} />}
          title="サインアップ完了"
          color="green"
          mb="lg"
        >
          確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
        </Alert>
      )}

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

            <PasswordInput
              label="パスワード"
              placeholder="パスワードを入力"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            {signInMutation.isError && (
              <Text c="red" size="sm">
                {signInMutation.error instanceof Error
                  ? signInMutation.error.message
                  : 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'}
              </Text>
            )}

            <Button type="submit" fullWidth loading={isSubmitting || signInMutation.isPending}>
              ログイン
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
