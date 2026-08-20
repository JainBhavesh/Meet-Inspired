import { Button } from '../../../components/Button/Button';

export interface JoinButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function JoinButton({ disabled, onClick }: JoinButtonProps) {
  return (
    <Button variant="primary" fullWidth disabled={disabled} onClick={onClick}>
      Join now
    </Button>
  );
}
