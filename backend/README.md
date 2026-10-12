To run:

```sh
deno task dev
```

open http://localhost:3000

On startup, Better Auth applies its schema migrations. Set `DEFAULT_USER_PWD`
to create the first admin account. Its username defaults to `admin` and can be
set with `DEFAULT_USER_NAME`; its email defaults to `admin@localhost.local` and
can be set with `DEFAULT_USER_EMAIL`. Existing default accounts without a role
are promoted to admin. After signing in, admins can manage accounts at `/users`
in the frontend.
