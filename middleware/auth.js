export default function ({
  store,
  error,
  route,
  redirect
}) {
  if (!store.state.authUser) {
    return redirect('/login')
  }
}
