import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { Api } from '../../../api/api';
import { apiusuariologin, Apiusuariologin$Params } from '../../../api/functions';
import { AuthService } from '../../../service/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        MessageModule
    ],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    private readonly fb     = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly api    = inject(Api);
    private readonly auth   = inject(AuthService);

    frmLogin: FormGroup = this.fb.group({
        username: ['', { validators: [Validators.required], updateOn: 'blur' }],
        password: ['', { validators: [Validators.required], updateOn: 'blur' }]
    });

    loading  = false;
    errorMsg = '';

    get usernameFb() { return this.frmLogin.controls['username']; }
    get passwordFb() { return this.frmLogin.controls['password']; }

    onSubmit(): void {
        this.frmLogin.updateValueAndValidity();

        if (this.frmLogin.invalid) {
            this.frmLogin.markAllAsTouched();
            return;
        }

        this.loading  = true;
        this.errorMsg = '';

        const params: Apiusuariologin$Params = {
            body: {
                username: this.usernameFb.value,
                password: this.passwordFb.value
            }
        };

        this.api.invoke(apiusuariologin, params)
            .then((data: any) => {
                if (data.type === 'success') {
                    this.auth.saveSession({
                        idUsuario: data.idUsuario,
                        nombres:   data.nombres,
                        username:  data.username,
                        rol:       data.rol,
                        token:     data.token
                    });
                    this.router.navigate([this.auth.getHomeRouteForRole(data.rol)]);
                } else {
                    this.errorMsg = data.listMessage?.[0] ?? 'Credenciales incorrectas.';
                }
            })
            .catch(() => {
                this.errorMsg = 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
            })
            .finally(() => {
                this.loading = false;
            });
    }
}
