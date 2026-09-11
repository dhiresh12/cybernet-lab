import { getCommandContract } from './commandRegistry';

describe('command registry contract', () => {
  test('marks read-only show commands explicitly', () => {
    expect(getCommandContract('show ip route')).toMatchObject({
      status: 'supported-reference',
      mode: 'EXEC',
      mutatesState: false,
    });
  });

  test('does not present BGP reference syntax as executable', () => {
    expect(getCommandContract('router bgp 65000')).toMatchObject({
      status: 'conceptual',
      mutatesState: false,
    });
  });

  test('keeps unknown configuration commands lab-dependent', () => {
    expect(getCommandContract('interface gigabitEthernet 0/1')).toMatchObject({
      status: 'lab-dependent',
      mode: 'configuration',
      mutatesState: true,
    });
  });
});
