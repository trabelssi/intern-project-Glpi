import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, useForm} from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {Link} from '@inertiajs/react';

export default function Create({auth, user}) {
    const {data, setData, post, errors, reset} = useForm({
        name: user.name || "",
        password: "",
        email: user.email || "",
        password_confirmation: "",
        _method: 'PUT',
    });

    const onSubmit = (e) => {
        e.preventDefault();
        post(route('user.update', user.id), {
            data: data,
            onSuccess: () => reset(),
            onError: () => console.log(errors),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                            Modifier l'Utilisateur: {user.name}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Modifier l'Utilisateur" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-8 transform transition-all duration-300 hover:scale-[1.01]">
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <div className="group">
                                    <InputLabel htmlFor="user_name" value="Nom d'Utilisateur" className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2" />
                                    <TextInput
                                        id="user_name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full bg-black/40 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-cyan-400"
                                        isFocused={true}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="group">
                                    <InputLabel htmlFor="user_email" value="Email d'Utilisateur" className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2" />
                                    <TextInput
                                        id="user_email"
                                        type="text"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full bg-black/40 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-cyan-400"
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="group">
                                    <InputLabel htmlFor="user_password" value="Mot de Passe" className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2" />
                                    <TextInput
                                        id="user_password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full bg-black/40 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-cyan-400"
                                        onChange={e => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="group">
                                    <InputLabel htmlFor="user_password_confirmation" value="Confirmer le mot de passe" className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2" />
                                    <TextInput
                                        id="user_password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full bg-black/40 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-cyan-400"
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end gap-4">
                                    <Link
                                        href={route('users.index')}
                                        className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-slate-500/20"
                                    >
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                                    >
                                        Mettre à jour
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}