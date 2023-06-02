import {Anchor, AnchorProps} from '@mantine/core';
import {useCallback, useContext, useRef} from 'react';
import {Link, LinkProps} from 'react-router-dom';
import {RoutesContext, preloadRoute} from './routes';
import {differenceInMinutes} from 'date-fns';

type PreloadLinkProps = LinkProps & AnchorProps;

export const PreloadLink: React.FC<PreloadLinkProps> = (props) => {
  const routes = useContext(RoutesContext);
  const preloadedAt = useRef<null | Date>(null);
  const preload = useCallback(() => {
    if (
      routes &&
      (!preloadedAt.current ||
        Math.abs(differenceInMinutes(new Date(), preloadedAt.current)) > 5)
    ) {
      preloadRoute(routes, props.to);
      preloadedAt.current = new Date();
    }
  }, [routes]);
  return (
    <Anchor
      component={Link}
      onFocus={preload}
      onMouseEnter={preload}
      {...props}
    />
  );
};
