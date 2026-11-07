import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from '@lampe/shared';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import { api, ApiError } from '@/lib/api';
export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { items: guestCart, clearCart } = useCart();
    const { toast } = useToast();
    const [serverError, setServerError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const returnTo = location.state?.returnTo ?? '/';
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(RegisterSchema),
    });
    async function handleRegisterSuccess(user) {
        login({ user });
        if (guestCart.length > 0) {
            try {
                await api.post('/cart/merge', guestCart.map((item) => ({ productId: item.productId, qty: item.qty })));
                clearCart();
            }
            catch {
                // non-blocking
            }
        }
        toast('Compte créé avec succès !', 'success');
        navigate(returnTo, { replace: true });
    }
    const onSubmit = async (data) => {
        setServerError(null);
        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/register', data);
            await handleRegisterSuccess(res.user);
        }
        catch (err) {
            if (err instanceof ApiError) {
                setServerError(err.message);
            }
            else {
                setServerError('Une erreur est survenue lors de la création du compte.');
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDevGoogleLogin = async () => {
        setServerError(null);
        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/google', {
                idToken: 'dev-token',
                mock: true,
            });
            await handleRegisterSuccess(res.user);
        }
        catch (err) {
            if (err instanceof ApiError) {
                setServerError(err.message);
            }
            else {
                setServerError('Connexion Google échouée.');
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12", children: _jsxs("div", { className: "w-full max-w-sm bg-surface border border-line rounded-modal p-8 shadow-mid", children: [_jsxs("div", { className: "flex flex-col items-center text-center mb-6", children: [_jsx(Link, { to: "/", "aria-label": "Accueil", className: "mb-4", children: _jsx(Logo, { size: "lg" }) }), _jsx("h1", { className: "text-xl font-heading font-bold text-ink", children: "Inscription" }), _jsx("p", { className: "text-xs text-mute mt-1", children: "Cr\u00E9ez votre compte client LampeOnline" })] }), serverError && (_jsx("div", { role: "alert", className: "mb-4 p-3 rounded-input bg-danger/10 border border-danger/20 text-xs text-danger", children: serverError })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Nom complet", type: "text", autoComplete: "name", placeholder: "Mohamed Salah", error: errors.name?.message, ...register('name') }), _jsx(Input, { label: "Adresse email", type: "email", autoComplete: "email", placeholder: "vous@example.com", error: errors.email?.message, ...register('email') }), _jsx(Input, { label: "Mot de passe", type: "password", autoComplete: "new-password", placeholder: "Minimum 8 caract\u00E8res", hint: "Au moins 8 caract\u00E8res", error: errors.password?.message, ...register('password') }), _jsx(Button, { type: "submit", variant: "primary", size: "md", className: "w-full mt-2", isLoading: isSubmitting, children: "Cr\u00E9er mon compte" })] }), _jsxs("div", { className: "relative my-6 text-center", children: [_jsx("div", { className: "absolute inset-0 flex items-center", "aria-hidden": "true", children: _jsx("div", { className: "w-full border-t border-line" }) }), _jsx("span", { className: "relative bg-surface px-2 text-[11px] uppercase tracking-wider text-mute", children: "Ou" })] }), _jsx(Button, { type: "button", variant: "secondary", size: "md", className: "w-full", onClick: handleDevGoogleLogin, isLoading: isSubmitting, children: "Dev mock Google account" }), _jsxs("p", { className: "text-center text-xs text-mute mt-6", children: ["D\u00E9j\u00E0 inscrit ?", ' ', _jsx(Link, { to: "/auth/login", state: { returnTo }, className: "text-teal font-medium hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-bulb", children: "Se connecter" })] })] }) }));
}
//# sourceMappingURL=RegisterPage.js.map