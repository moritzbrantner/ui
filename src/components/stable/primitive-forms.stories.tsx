import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "lucide-react";

import { Badge } from "./badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import { Input } from "./input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp";
import { Kbd } from "./kbd";
import { Label } from "./label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";
import { ScrollArea } from "./scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";

function PrimitiveFormsPreview() {
  return (
    <div className="grid w-[min(920px,calc(100vw-2rem))] gap-4 p-4 md:grid-cols-2">
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">field</Badge>
        <FieldSet>
          <FieldLegend>Package metadata</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="primitive-forms-field">Package name</FieldLabel>
              <Input id="primitive-forms-field" defaultValue="@moritzbrantner/ui" />
              <FieldDescription>Used for package publishing.</FieldDescription>
            </Field>
            <FieldSeparator>or</FieldSeparator>
            <Field orientation="horizontal">
              <Checkbox id="primitive-forms-check" aria-label="Enable preview" />
              <FieldContent>
                <FieldTitle>Enable preview</FieldTitle>
                <FieldDescription>Show component previews in docs.</FieldDescription>
              </FieldContent>
            </Field>
            <FieldError>Example validation message.</FieldError>
          </FieldGroup>
        </FieldSet>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">input-group</Badge>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search input group" placeholder="Search" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <Kbd>/</Kbd>
            </InputGroupText>
            <InputGroupButton size="xs">Go</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea aria-label="Input group textarea" placeholder="Notes" />
        </InputGroup>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">input-otp</Badge>
        <InputOTP aria-label="Package verification code" maxLength={6} value="123456">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">selects</Badge>
        <Label htmlFor="primitive-forms-label">Release channel</Label>
        <Input id="primitive-forms-label" defaultValue="stable" />
        <NativeSelect defaultValue="ui" aria-label="Package native select">
          <NativeSelectOptGroup label="Packages">
            <NativeSelectOption value="ui">UI</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
        <Select defaultValue="ui">
          <SelectTrigger aria-label="Package select">
            <SelectValue placeholder="Select package" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Packages</SelectLabel>
              <SelectItem value="ui">UI</SelectItem>
              <SelectSeparator />
              <SelectItem value="maps">Maps</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">textarea</Badge>
        <Textarea aria-label="Package notes" defaultValue="Check Storybook before release." />
      </section>
      <section className="grid gap-3 border border-border/60 bg-card/55 p-4">
        <Badge variant="outline">scroll-area</Badge>
        <ScrollArea className="h-28 border border-border/60 p-3">
          <div className="grid gap-2">
            {Array.from({ length: 8 }, (_, index) => (
              <Input
                key={index}
                aria-label={`Package row ${index + 1}`}
                readOnly
                value={`Package row ${index + 1}`}
              />
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}

const meta = {
  title: "Components/Stable/Primitive Forms",
  component: PrimitiveFormsPreview,
  tags: ["autodocs", "test"],
} satisfies Meta<typeof PrimitiveFormsPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
