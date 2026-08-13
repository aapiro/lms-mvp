import { renderHook, act } from '@testing-library/react';
import useForm from '../hooks/useForm';

const changeEvent = (name, value, type = 'text', checked = false) => ({
  target: { name, value, type, checked },
});

test('handleChange updates values and clears the field error', async () => {
  const { result } = renderHook(() =>
    useForm({
      initialValues: { title: '' },
      validate: (v) => ({ title: !v.title ? 'Required' : '' }),
      onSubmit: vi.fn(),
    })
  );

  await act(() => result.current.handleSubmit());
  expect(result.current.errors.title).toBe('Required');

  act(() => result.current.handleChange(changeEvent('title', 'Curso')));
  expect(result.current.values.title).toBe('Curso');
  expect(result.current.errors.title).toBe('');
});

test('checkbox change stores the checked flag, not the value', () => {
  const { result } = renderHook(() =>
    useForm({ initialValues: { active: false }, onSubmit: vi.fn() })
  );

  act(() => result.current.handleChange(changeEvent('active', 'on', 'checkbox', true)));
  expect(result.current.values.active).toBe(true);
});

test('submit with validation errors never calls onSubmit', async () => {
  const onSubmit = vi.fn();
  const { result } = renderHook(() =>
    useForm({
      initialValues: { title: '' },
      validate: (v) => ({ title: !v.title ? 'Required' : '' }),
      onSubmit,
    })
  );

  let ok;
  await act(async () => { ok = await result.current.handleSubmit(); });
  expect(ok).toBe(false);
  expect(onSubmit).not.toHaveBeenCalled();
});

test('valid submit calls onSubmit with values and reset restores initial state', async () => {
  const onSubmit = vi.fn().mockResolvedValue();
  const { result } = renderHook(() =>
    useForm({ initialValues: { title: '' }, onSubmit })
  );

  act(() => result.current.handleChange(changeEvent('title', 'Curso')));
  let ok;
  await act(async () => { ok = await result.current.handleSubmit(); });
  expect(ok).toBe(true);
  expect(onSubmit).toHaveBeenCalledWith({ title: 'Curso' });

  act(() => result.current.reset());
  expect(result.current.values).toEqual({ title: '' });
});
