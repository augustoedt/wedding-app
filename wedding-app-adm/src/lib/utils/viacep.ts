export interface ViaCepAddress {
	logradouro: string;
	bairro: string;
	localidade: string;
	uf: string;
	erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
	const digits = cep.replace(/\D/g, '');
	if (digits.length !== 8) return null;

	const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
	if (!res.ok) return null;

	const data = await res.json();
	if (data.erro) return null;

	return data;
}
