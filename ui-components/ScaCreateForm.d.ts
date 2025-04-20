import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type ScaCreateFormInputValues = {
    partner?: string;
    start_date?: string;
    end_date?: string;
    contract_name?: string;
    contract_description?: string;
    contract_type?: string;
    contract_status?: string;
    contract_comments?: string;
    contract_aws_contributions?: string;
    contract_partner_contributions?: string;
    contract_time_based_targets?: string;
    contract_primary_industry?: string;
    contract_overall_status?: string;
    contract_theme?: string;
};
export declare type ScaCreateFormValidationValues = {
    partner?: ValidationFunction<string>;
    start_date?: ValidationFunction<string>;
    end_date?: ValidationFunction<string>;
    contract_name?: ValidationFunction<string>;
    contract_description?: ValidationFunction<string>;
    contract_type?: ValidationFunction<string>;
    contract_status?: ValidationFunction<string>;
    contract_comments?: ValidationFunction<string>;
    contract_aws_contributions?: ValidationFunction<string>;
    contract_partner_contributions?: ValidationFunction<string>;
    contract_time_based_targets?: ValidationFunction<string>;
    contract_primary_industry?: ValidationFunction<string>;
    contract_overall_status?: ValidationFunction<string>;
    contract_theme?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type ScaCreateFormOverridesProps = {
    ScaCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    partner?: PrimitiveOverrideProps<TextFieldProps>;
    start_date?: PrimitiveOverrideProps<TextFieldProps>;
    end_date?: PrimitiveOverrideProps<TextFieldProps>;
    contract_name?: PrimitiveOverrideProps<TextFieldProps>;
    contract_description?: PrimitiveOverrideProps<TextFieldProps>;
    contract_type?: PrimitiveOverrideProps<TextFieldProps>;
    contract_status?: PrimitiveOverrideProps<TextFieldProps>;
    contract_comments?: PrimitiveOverrideProps<TextFieldProps>;
    contract_aws_contributions?: PrimitiveOverrideProps<TextFieldProps>;
    contract_partner_contributions?: PrimitiveOverrideProps<TextFieldProps>;
    contract_time_based_targets?: PrimitiveOverrideProps<TextFieldProps>;
    contract_primary_industry?: PrimitiveOverrideProps<TextFieldProps>;
    contract_overall_status?: PrimitiveOverrideProps<TextFieldProps>;
    contract_theme?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type ScaCreateFormProps = React.PropsWithChildren<{
    overrides?: ScaCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: ScaCreateFormInputValues) => ScaCreateFormInputValues;
    onSuccess?: (fields: ScaCreateFormInputValues) => void;
    onError?: (fields: ScaCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: ScaCreateFormInputValues) => ScaCreateFormInputValues;
    onValidate?: ScaCreateFormValidationValues;
} & React.CSSProperties>;
export default function ScaCreateForm(props: ScaCreateFormProps): React.ReactElement;
