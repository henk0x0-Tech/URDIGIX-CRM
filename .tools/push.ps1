$env:DATABASE_URL="postgresql://postgres:Balakrishna%40143@db.zluajqremconqvwcdebb.supabase.co:5432/postgres"
pnpm --filter=@urdigix/api exec prisma db push
pnpm --filter=@urdigix/api seed
